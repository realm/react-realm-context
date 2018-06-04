FROM node:8-alpine

# Use the same user as CI will eventually be running with
RUN useradd -ms /bin/bash jenkins
USER jenkins
SHELL ["/bin/bash", "-c"]
