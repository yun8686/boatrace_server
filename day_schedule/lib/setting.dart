import 'dart:io';

import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';

import 'Provider/AskQuestionProvider.dart';

class Setting extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text("設定"),
      ),
      body: ListView(
        children: <Widget>[
          ListTile(
            title: Text("プライバシーポリシー"),
            subtitle: Text("当アプリのプライバシーポリシーです"),
            onTap: () {
              showPrivacyPolicy(context);
            },
          ),
          ListTile(
            title: Text("お問い合わせ"),
            subtitle: Text("ご要望や質問はこちらへどうぞ"),
            onTap: (){
              showAskQuestion(context);
            },
          ),
        ],
      ),
    );
  }

  void showPrivacyPolicy(BuildContext context) {
    showModalBottomSheet(
      context: context,
      builder: (BuildContext context) {
        // ModalBottomSheet を押した時のイベントを捕まえるために
        // GestureDetector でラップする
        return new GestureDetector(
          onTap: () {
            // ModalBottomSheet を押した時には何もしないようにする
          },
          child: new Container(
            // ModalBottomSheet のどこを押してもラップした GestureDetector が
            // 検知できるように、ラップした Container には色をつけておく
            color: Colors.white,
            padding: const EdgeInsets.all(16.0),
            child: new Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'プライバシーポリシー',
                  style: TextStyle(fontWeight: FontWeight.bold),
                ),
                Text(
                    '本アプリでは、広告配信ツールとしてAdMob(Google Inc.)を使用しており、AdMobがご利用者の情報を自動取得する場合がございます。'),
                Text(
                    '取得する情報、利用目的、第三者への提供等につきましては、以下の広告配信事業者のアプリケーション・プライバシーポリシーのリンクよりご確認ください。'),
                Text('Google 広告に関するポリシー'),
                GestureDetector(
                  child: Text(
                      'https://policies.google.com/technologies/ads?hl=ja'),
                  onTap: () async {
                    const url =
                        "https://policies.google.com/technologies/ads?hl=ja";
                    if (await canLaunch(url)) {
                      await launch(url);
                    } else {
                      throw 'Could not launch $url';
                    }
                  },
                )
              ],
            ),
          ),
        );
      },
    );
  }

  String askQuestionText = "";
  void showAskQuestion(BuildContext context){
    FocusNode _inputFocusNode = FocusNode();
    TextEditingController _textEditingController = TextEditingController(text: askQuestionText);
    showModalBottomSheet(
      context: context,
      builder: (BuildContext context) {
        // ModalBottomSheet を押した時のイベントを捕まえるために
        // GestureDetector でラップする
        return new GestureDetector(
          onTap: () {
            _inputFocusNode.unfocus();
          },
          child: new Container(
            // ModalBottomSheet のどこを押してもラップした GestureDetector が
            // 検知できるように、ラップした Container には色をつけておく
            color: Colors.white,
            padding: const EdgeInsets.all(16.0),
            child: new Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'お問い合わせ',
                  style: TextStyle(fontWeight: FontWeight.bold),
                ),
                Text(
                  'こちらに入力いただきました内容は、アプリのアップデートの参考にさせていただきます。',
                ),
                Text(
                  '返信が必要な場合は、返信先のご記載をおねがいいたします。',
                ),
                TextField(
                  controller: _textEditingController,
                  focusNode: _inputFocusNode,
                  enabled: true,
                  // 入力数
                  maxLength: 500,
                  maxLengthEnforced: false,
                  style: TextStyle(color: Colors.black),
                  obscureText: false,
                  maxLines:10 ,
                  onChanged: (value){
                    askQuestionText = value;
                  },
                ),
                Row(
                  mainAxisAlignment: MainAxisAlignment.end,
                  children: <Widget>[
                    RaisedButton(
                      child: Text("送信", style: TextStyle(color: Colors.white,),),
                      color: Colors.blue,
                      shape: RoundedRectangleBorder(
                        borderRadius: new BorderRadius.circular(10.0),
                      ),
                      onPressed: () async {
                        await AskQuestionProvider.addMessage(askQuestionText);
                      },
                    )
                  ],
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}
