FROM log2-prod-i

ENV NODE_ENV=development

RUN chmod +x /var/app/initialize.sh
CMD ["./initialize.sh"]

