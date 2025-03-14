"""
For Dr. Ngo's CSC468 at West Chester University. The goal is to create a
cloud-based RSS & Atom feed reader.

Instructions:
When it's finished, simply in instantiating this profile should bring everything
up. There may be more work to get TLS working.
"""

import geni.portal as portal
import geni.rspec.pg as rspec

# Create a Request object to start building the RSpec.
request = portal.context.makeRequestRSpec()

# Life is too short for VMs
node = request.RawPC("node")
# node.disk_image = "urn:publicid:IDN+emulab.net+image+emulab-ops:UBUNTU22-64-STD"
node.routable_control_ip = "true"

node.addService(rspec.Execute(shell="/bin/sh", command="sudo apt update; sudo apt install -y docker.io docker-compose neovim curl"))

node.addService(rspec.Execute(shell="/bin/sh", command="curl --proto '=https' --tlsv1.2 -sSf -L https://install.lix.systems/lix | sudo sh -s -- install linux --enable-flakes --no-confirm"))


# Print the RSpec to the enclosing page.
portal.context.printRequestRSpec()
