use anyhow::{ensure, Context};
use std::{
    env,
    ffi::OsString,
    fs::{read_dir, remove_file, File},
    os::unix::{fs::chown, process::CommandExt},
    path::Path,
    process::{exit, Command},
};

fn main() -> anyhow::Result<()> {
    // TODO: allow flags to `initdb`? like `--data-checksums`
    if let [_, postgres, pg_conf, initdb, initscript] = &*env::args_os().collect::<Vec<_>>() {
        let pgdata = env::var_os("PGDATA").context("$PGDATA must be set")?;

        const NOBODY_ID: u32 = 65534;
        chown(&pgdata, Some(NOBODY_ID), Some(NOBODY_ID)).context("While `chown`ing $PGDATA")?;
        // This is to appease initdb

        let mut pgdata_contents = read_dir(&pgdata).context("While reading PGDATA")?;

        let mut arg2: OsString = "config_file=".into();
        arg2.push(pg_conf);

        let postgres_args = ["-c".into(), arg2];

        if pgdata_contents.next().is_none() {
            // Directory is empty, ie no database exists
            let initscript = File::open(initscript).context("While opening initscript")?;

            let status = Command::new(initdb)
                .args(&postgres_args)
                .uid(NOBODY_ID)
                .gid(NOBODY_ID)
                .arg("--no-instructions")
                .status()
                .context("While running `initdb`")?;
            ensure!(status.success(), "`initdb` encountered errors");

            let pgdata_path = Path::new(&pgdata);

            for conf_file in [
                "pg_hba.conf",
                "pg_ident.conf",
                "postgresql.auto.conf",
                "postgresql.conf",
            ] {
                remove_file(pgdata_path.join(conf_file))?;
            }

            let status = Command::new(postgres)
                .arg("--single") // Read from stdin, don't run a server. Must be first
                .args(&postgres_args)
                .uid(NOBODY_ID)
                .gid(NOBODY_ID)
                .arg("-jE") // Ignore newlines & echo commands before running
                .arg("postgres") // DB name
                .stdin(initscript)
                .status()
                .context("While running `postgres --single` initialization")?;
            ensure!(status.success(), "`postgres --single` encountered errors");
            // FIXME?: `postgres --single` doesn't exit on invalid SQL

            // TODO: initialize db
            // - create user for backend
        }

        let res = Command::new(postgres)
            .args(&postgres_args)
            .uid(NOBODY_ID)
            .gid(NOBODY_ID)
            .exec();

        // If we reach here, `exec` must have failed
        Err(res).context("While `exec`ing `postgres`")
    } else {
        eprintln!("usage: <postgres> <pg_conf> <initdb> <initscript>");
        exit(1);
    }
}
