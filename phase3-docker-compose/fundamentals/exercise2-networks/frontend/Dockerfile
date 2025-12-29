FROM nginx:alpine

# Copy nginx config
COPY nginx.conf /etc/nginx/nginx.conf

# Copy HTML
COPY index.html /usr/share/nginx/html/

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=10s --timeout=3s --start-period=5s \
    CMD wget -q --spider http://localhost/ || exit 1