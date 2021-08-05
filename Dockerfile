# Date version = 2021-08-02
# build stage
# Node 14.17 = Latest LTS version
FROM node:14.17 as build-stage 
WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH
COPY package.json /app/package.json
RUN npm install --silent
COPY . /app
RUN npm run build

# production environment
# Nginx 1.18 = Latest stable version
FROM nginx:1.20 as production-stage
COPY --from=build-stage /app/asset/dist /usr/share/nginx/html
COPY --from=build-stage /app/asset /usr/share/nginx/html/
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx/nginx.conf /etc/nginx/conf.d
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]