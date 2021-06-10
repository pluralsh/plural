FROM jbergknoff/postgresql-client

COPY dump.sh /root
RUN chmod +x /root/dump.sh

ENTRYPOINT /root/dump.sh