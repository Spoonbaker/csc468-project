use anyhow::{ensure, Context};
use std::{
    env,
    ffi::OsString,
    fs::{read_dir, File},
    os::unix::process::CommandExt,
    process::{exit, Command},
};

fn main() -> anyhow::Result<()> {
    // TODO: allow flags to `initdb`? like `--data-checksums`
    if let [_, postgres, pg_conf, initdb, initscript] = &*env::args_os().collect::<Vec<_>>() {
        let pgdata = env::var_os("PGDATA").context("$PGDATA must be set")?;

        let mut pgdata = read_dir(pgdata).context("While reading PGDATA")?;

        let mut arg2: OsString = "config_file=".into();
        arg2.push(pg_conf);

        let postgres_args = ["-c".into(), arg2];

        if pgdata.next().is_none() {
            // Directroy is empty, ie no database exists
            let initscript = File::open(initscript).context("While opening initscript")?;

            let status = Command::new(initdb)
                .args(&postgres_args)
                .arg("--no-instructions")
                .status()
                .context("While running `initdb`")?;
            ensure!(status.success(), "`initdb` encountered errors");

            // TODO: use `pg_ctl` like https://stackoverflow.com/a/28246926 ?
            let status = Command::new(postgres)
                .arg("--single") // Read from stdin, don't run a server. Must be first
                .args(&postgres_args)
                .arg("-E") // Echo commands before running
                .arg("postgres") // DB name
                .stdin(initscript)
                .status()
                .context("While running `postgres --single` initialization")?;
            ensure!(status.success(), "`postgres --single` encountered errors");
            // FIXME?: `postgres --single` doesn't exit on invalid SQL

            // TODO: initialize db
            // - create user for backend
        }

        let res = Command::new(postgres).args(&postgres_args).exec();

        // If we reach here, `exec` must have failed
        Err(res).context("While `exec`ing `postgres`")
    } else {
        eprintln!("usage: <postgres> <pg_conf> <initdb> <initscript>");
        exit(1);
    }
}
