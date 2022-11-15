FROM cypress/included:11.0.1

# Install latest stable chrome browser
RUN wget -q https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
RUN dpkg -i google-chrome-stable_current_amd64.deb
RUN apt -f install -y

COPY ./ /e2e/

WORKDIR /e2e

RUN yarn install --immutable
