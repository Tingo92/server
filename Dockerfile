FROM node:11
RUN rm /bin/sh && ln -s /bin/bash /bin/sh
EXPOSE 3000 3001
COPY . .
CMD bin/docker_run.sh