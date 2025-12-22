# nginx reverse proxy dockerfile with ssl/tls support
FROM nginx:alpine

# copies nginx configuration file
COPY nginx.conf /etc/nginx/nginx.conf

# creates directory for ssl certificates
RUN mkdir -p /etc/nginx/ssl

# exposes http port (redirects to https)
EXPOSE 80

# exposes https port (main application port)
EXPOSE 443

# starts nginx in foreground mode
CMD ["nginx", "-g", "daemon off;"]
