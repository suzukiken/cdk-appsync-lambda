+++
title = "AppSyncのLambdaリゾルバ"
date = "2021-04-27"
tags = ["AppSync", "Dynamo DB"]
+++

AppSyncのリゾルバとしてLambdaを使うサンプルを作った。

やっていることはCloudFormationで作った主なリソースやエクスポートした情報をリストするというもので、最近沢山作ることになるCloudFormationのスタックや、既存のシステムとのリソースの情報の共有だとをどうするか、ということが自分の中での1つの課題なので、つい無意識にAppSyncから呼び出せるように作ってしまい、しかも動いてしまったのでこれをLambdaをリゾルバにする場合の一つの例として載せておくことにしたというわけだ。

[Githubのリポジトリ](https://github.com/suzukiken/cdkappsync-lambda)
