FROM ubuntu:14.04

# This was copied from an answer on https://stackoverflow.com/questions/25899912/install-nvm-in-docker

ENV NVM_VERSION v0.33.11
ENV NODE_VERSION v8

# Install pre-reqs
RUN apt-get update && apt-get install -y \
  curl \
  build-essential \
&& rm -rf /var/lib/apt/lists/*

# Use the same user as CI will eventually be running with
RUN useradd -ms /bin/bash jenkins
USER jenkins
SHELL ["/bin/bash", "-c"]

# Install NVM
RUN curl -o- https://raw.githubusercontent.com/creationix/nvm/${NVM_VERSION}/install.sh | bash

# Install NODE
RUN source ~/.nvm/nvm.sh; \
    nvm install $NODE_VERSION; \
    nvm alias default $NODE_VERSION;
