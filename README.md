# Keg CLI
* Commands for running taps, and other keg related tasks

## Setup
* Follow the instructions for installing and validating the keg cli

### Install
* Create a folder named `keg` at `~/keg`
  * `mkdir -p ~/keg`
* Navigate to `keg` directory
  * `cd ~/keg`
* Git clone the [keg-cli](https://github.com/lancetipton/keg-cli.git) repo locally to `~/keg/keg-cli`
  * `git clone https://github.com/lancetipton/keg-cli.git ~/keg/keg-cli`
* Run the bash setup script
  * `bash keg-cli/scripts/setup/mac-init.sh`
* It should print `[ KEG CLI ] Keg CLI setup complete!`
  * This message may still print even it an error was thrown
    * Be sure to check the log output
* Run the keg global setup task in the terminal
  * `keg global setup`
    * This task will setup up the keg-cli on the local machine
    * It will ask a few questions, so please pay attention

### Validate
* Run the key global validate task in the terminal
  * `keg global validate`
    * This task should validate the install
    * If a problem is found it will try to fix it
    * If the problem can not be fixed, it will let you know

### Architecture
* `src/`
  * `libs/`
    * wrappers around external APIs, such as the Docker CLI
  * `tasks/`
    * implementations of cli commands
  * `templates/`
    * templates used for generated files
  * `utils/`
    * helper functions 

### Configuration
* taps have envs set in their containers folder
  * example: `containers/proxy/values-staging.yml`
* custom configuration files are located at `.kegConfig/` in your home directory
* the `.kegConfig/defaults.env` file sets defaults not defined by the `containers/*` configs
* you can also override these values for specific containers and environments
  * add a `.kegConfig/<repo_name>-<environment>.env` file 
  * example: `.kegConfig/evf-staging.env`
    * this will override envs for the `evf` tap when in the `staging` environment
    * `-<environment>` is optional. If omitted, the file will apply to all environments.
