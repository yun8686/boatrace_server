import 'dart:collection';

import 'package:day_schedule/Provider/ScheduleProvider.dart';
import 'package:day_schedule/setting.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';

import 'package:admob_flutter/admob_flutter.dart';
import 'dart:io';
import 'package:url_launcher/url_launcher.dart';

import 'Database/Schedule.dart';

void main() => runApp(MyApp());

class MyApp extends StatelessWidget {
  // This widget is the root of your application.
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: '競艇スケジュール',
      theme: ThemeData(
        primarySwatch: Colors.blue,
      ),
      home: MyHomePage(title: '競艇スケジュール'),
      debugShowCheckedModeBanner: false,
    );
  }
}

class MyHomePage extends StatefulWidget {
  MyHomePage({Key key, this.title}) : super(key: key);
  final String title;

  @override
  _MyHomePageState createState() => _MyHomePageState();
}

class _MyHomePageState extends State<MyHomePage> {
  List<TimeTable> timeTables = List<TimeTable>();
  static CollectionReference collection = Firestore.instance.collection("schedules");
  String _tabTitle = "";
  String _todayStr = "";
  @override
  void initState(){
    refresh().then((d){
      setState((){});
    });
    super.initState();
  }

  Future<void> refresh()async{
    DateTime now = DateTime.now();
    _todayStr = now.year.toString() + now.month.toString().padLeft(2,'0') + now.day.toString().padLeft(2,'0');
    _tabTitle = now.year.toString() + "/" + now.month.toString().padLeft(2,'0') + "/" + now.day.toString().padLeft(2,'0');;
    List<Schedule> schedules = await ScheduleProvider.getSchedule(_todayStr);
    timeTables = List<TimeTable>();
    HashMap<int, TimeTable> hourMap = HashMap<int, TimeTable>();
    schedules.forEach((Schedule schedule){
      schedule.timeList.forEach((TimeList timelist){
        if(!hourMap.containsKey(timelist.hour)){
          hourMap[timelist.hour] = TimeTable(hour: timelist.hour, kaijoList: <Kaijo>[]);
          timeTables.add(hourMap[timelist.hour]);
        }
        hourMap[timelist.hour].kaijoList.add(
            Kaijo(
              name: schedule.jouname+timelist.raceno,
              minute: timelist.minute,
              rno: timelist.rno,
              jcd: schedule.jcd,
              info: timelist.info,
              info2: timelist.info2,
              info3: timelist.info3,
            )
        );
      });
    });
    if(hourMap[now.hour] != null) hourMap[now.hour].isExpanded = true;
    timeTables.sort((a,b){return a.hour-b.hour;});
    timeTables.forEach((timeTable){
      timeTable.kaijoList.sort((a,b){return a.minute-b.minute;});
    });
  }
  @override
  Widget build(BuildContext context) {
    return DefaultTabController(
      length: 1,
      child: Scaffold(
        appBar: AppBar(
          actions: <Widget>[
            IconButton(
              icon: const Icon(Icons.refresh, color: Colors.white),
              onPressed: (){
                return refresh().then((d){
                  setState((){});
                });
              },
            ),
            IconButton(
              icon: const Icon(Icons.settings, color: Colors.white),
              onPressed: (){
                Navigator.of(context).push(
                  MaterialPageRoute(
                    builder: (context) {
                      return Setting();
                    },
                  ),
                );
              },
            ),
          ],
          title: Text('競艇タイムスケジュール'),
          bottom: PreferredSize(
            child: TabBar(
              isScrollable: true,
              tabs: <Tab>[
                Tab(text: _tabTitle),
              ],
            ),
            preferredSize: Size.fromHeight(30.0),
          ),
        ),
        body: TabBarView(children: <Widget>[
          Column(
            children: <Widget>[
              AdmobBanner(
                adUnitId: getBannerAdUnitId(),
                adSize: AdmobBannerSize.BANNER,
              ),
              Expanded(child: _scheduleList(),),
            ],
          ),
        ]),
      ),
    );
  }
  Widget _scheduleList(){
    if(timeTables.length == 0){
      return Text("ロード中");
    }
    return RefreshIndicator(
      onRefresh: (){
        return refresh().then((d){
          setState((){});
        });
      },
      child: ListView(
        physics: BouncingScrollPhysics(),
        children: timeTables.map(_createExpansionPanel).toList(),
      ),
    );
  }
  Widget _createExpansionPanel(TimeTable timeTable){
    return Container(
      margin: EdgeInsets.symmetric(horizontal: 8.0, vertical: 4.0),
      padding: const EdgeInsets.all(0),
      child: ExpansionTile(
        initiallyExpanded: timeTable.isExpanded,
        title: Text(timeTable.hour.toString() + "時台"),
        children: timeTable.kaijoList.map((kaijo){
          String url = 'https://www.boatrace.jp/owsp/sp/race/beforeinfo?hd=${_todayStr}&jcd=${kaijo.jcd}&rno=${kaijo.rno}';
          String infoText = "";
          if(kaijo.isEnd){
            infoText = (kaijo.info??"") + "\n" + (kaijo.info2??"") + "\n" + (kaijo.info3??"");
          }else{
            infoText = (kaijo.info??"") + "\n" + (kaijo.info2??"");
          }
          return _CustomListTile(
            url: url,
            raceName: kaijo.name,
            time: timeTable.hour.toString().padLeft(2,"0") + ":" + kaijo.minute.toString().padLeft(2,"0"),
            infoText: infoText,
            isEnd: kaijo.isEnd,
          );
        }).toList(),
      ),
    );
  }



  String getBannerAdUnitId() {
    if (Platform.isIOS) {
      return 'ca-app-pub-2360113281922238/4368104120';
    } else if (Platform.isAndroid) {
      return 'ca-app-pub-2360113281922238/1252901915';
    }
    return null;
  }
}

class _CustomListTile extends StatelessWidget{
  String url;
  String raceName;
  String time;
  String infoText = "-";
  bool isEnd;
  _CustomListTile({this.url, this.raceName, this.time, this.infoText, this.isEnd});
  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration (
          color: this.isEnd?Colors.grey:Colors.transparent
      ),
      child: ListTile(
        trailing: Icon(Icons.arrow_forward_ios),
        onTap: ()async{
          if (await canLaunch(url)) {
            await launch(url);
          } else {
            throw 'Could not launch $url';
          }
        },
        isThreeLine: true,
        title: Text(
          '$raceName ( 締切: $time )'??"",
        ),
        subtitle: Text(
          (infoText??""),
        ),
      ),
    );
  }

}

/*
 */

class TimeTable{
  int hour;
  List<Kaijo> kaijoList;
  bool isExpanded = false;
  TimeTable({this.hour, this.kaijoList});
}
class Kaijo{
  String name;
  int minute;
  String jcd;
  String rno;
  String info, info2, info3;
  bool isEnd; // 終了しているかどうか
  Kaijo({this.name, this.minute, this.jcd, this.rno, this.info, this.info2, this.info3}){
    this.isEnd = (this.info3 != null);  // 結果があれば終了
  }
}
