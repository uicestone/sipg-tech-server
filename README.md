[![Build Status](https://travis-ci.org/uicestone/sipg-tech-server.svg?branch=master)](https://travis-ci.org/uicestone/sipg-tech-server)

# sipg-tech-server

## Project setup

```
yarn
```

then create a .env file from .env.example.

### Development

```
yarn dev
```

### Compiles and minifies for production

```
yarn build
```

### Lints and fixes files

```
yarn lint
```

# APIs

`GET /stats`

```
{
}
```

## 登陆和鉴权

`POST /auth/login`

```
{
  "login":string,
  "password":string
}
```

```
{
  "token":string,
  "user":{}
}
```

`GET /auth/user`

## 查询机械

`GET /machine`

queries: `?`

`keyword=`

## 修改机械

`PATCH /machine`

## 查询用户

`/user`

queries: `?`

`keyword=`

## 创建用户

`POST /user`

``
