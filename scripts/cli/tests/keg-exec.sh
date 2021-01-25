#!/bin/bash
# ****************************** INFO ****************************** #
# Helper script for calling the keg-cli from javascirpt              #
# Allows testing keg-cli commands as if run from the hosts terminal  #
# ****************************** INFO ****************************** #

# Ensure the script exits when a command fails
set -e

# Load the keg bash script so we can access keg directly
source ./keg

keg "$@"
