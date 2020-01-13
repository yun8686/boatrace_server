import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';

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
  int _counter = 0;
  List<TimeTable> timeTables = List<TimeTable>();
  static CollectionReference collection = Firestore.instance.collection("schedules");

  @override
  void initState(){
    collection.document("20200113").get().then((DocumentSnapshot schedules){
      print(schedules.data);
    });
    timeTables.add(TimeTable(hour:08, kaijoList: <Kaijo>[Kaijo(name:"23", minute:46), Kaijo(name:"14", minute:55),]));
    timeTables.add(TimeTable(hour:09, kaijoList: <Kaijo>[Kaijo(name:"23", minute:15), Kaijo(name:"14", minute:24), Kaijo(name:"23", minute:44), Kaijo(name:"14", minute:53),]));
    timeTables.add(TimeTable(hour:10, kaijoList: <Kaijo>[Kaijo(name:"23", minute:14), Kaijo(name:"14", minute:22), Kaijo(name:"11", minute:34), Kaijo(name:"13", minute:34), Kaijo(name:"23", minute:44), Kaijo(name:"22", minute:50), Kaijo(name:"02", minute:51), Kaijo(name:"14", minute:51),]));
    timeTables.add(TimeTable(hour:11, kaijoList: <Kaijo>[Kaijo(name:"13", minute:00), Kaijo(name:"04", minute:01), Kaijo(name:"11", minute:01), Kaijo(name:"23", minute:14), Kaijo(name:"02", minute:16), Kaijo(name:"17", minute:18), Kaijo(name:"22", minute:19), Kaijo(name:"14", minute:21), Kaijo(name:"04", minute:26), Kaijo(name:"13", minute:27), Kaijo(name:"11", minute:28), Kaijo(name:"02", minute:42), Kaijo(name:"17", minute:45), Kaijo(name:"23", minute:46), Kaijo(name:"22", minute:48), Kaijo(name:"04", minute:51), Kaijo(name:"14", minute:52), Kaijo(name:"11", minute:55),]));
    timeTables.add(TimeTable(hour:12, kaijoList: <Kaijo>[Kaijo(name:"02", minute:08), Kaijo(name:"17", minute:11), Kaijo(name:"22", minute:17), Kaijo(name:"04", minute:18), Kaijo(name:"23", minute:19), Kaijo(name:"14", minute:25), Kaijo(name:"13", minute:30), Kaijo(name:"02", minute:35), Kaijo(name:"17", minute:38), Kaijo(name:"13", minute:41), Kaijo(name:"11", minute:45), Kaijo(name:"04", minute:46), Kaijo(name:"22", minute:46), Kaijo(name:"23", minute:52), Kaijo(name:"13", minute:53), Kaijo(name:"14", minute:58),]));
    timeTables.add(TimeTable(hour:13, kaijoList: <Kaijo>[Kaijo(name:"02", minute:03), Kaijo(name:"13", minute:05), Kaijo(name:"17", minute:06), Kaijo(name:"11", minute:13), Kaijo(name:"04", minute:14), Kaijo(name:"22", minute:16), Kaijo(name:"13", minute:17), Kaijo(name:"23", minute:27), Kaijo(name:"13", minute:29), Kaijo(name:"02", minute:31), Kaijo(name:"17", minute:35), Kaijo(name:"11", minute:41), Kaijo(name:"13", minute:41), Kaijo(name:"04", minute:42), Kaijo(name:"22", minute:47), Kaijo(name:"14", minute:48), Kaijo(name:"13", minute:53),]));
    timeTables.add(TimeTable(hour:14, kaijoList: <Kaijo>[Kaijo(name:"02", minute:00), Kaijo(name:"17", minute:03), Kaijo(name:"23", minute:04), Kaijo(name:"11", minute:09), Kaijo(name:"04", minute:11), Kaijo(name:"13", minute:12), Kaijo(name:"14", minute:18), Kaijo(name:"22", minute:18), Kaijo(name:"02", minute:30), Kaijo(name:"17", minute:31), Kaijo(name:"11", minute:38), Kaijo(name:"04", minute:40), Kaijo(name:"23", minute:44), Kaijo(name:"14", minute:49), Kaijo(name:"22", minute:49), Kaijo(name:"17", minute:59), Kaijo(name:"20", minute:59),]));
    timeTables.add(TimeTable(hour:15, kaijoList: <Kaijo>[Kaijo(name:"02", minute:01), Kaijo(name:"11", minute:07), Kaijo(name:"20", minute:08), Kaijo(name:"04", minute:11), Kaijo(name:"24", minute:18), Kaijo(name:"20", minute:19), Kaijo(name:"22", minute:21), Kaijo(name:"17", minute:28), Kaijo(name:"20", minute:28), Kaijo(name:"02", minute:32), Kaijo(name:"11", minute:37), Kaijo(name:"20", minute:38), Kaijo(name:"04", minute:42), Kaijo(name:"24", minute:43), Kaijo(name:"20", minute:48), Kaijo(name:"22", minute:54), Kaijo(name:"17", minute:58), Kaijo(name:"20", minute:58),]));
    timeTables.add(TimeTable(hour:16, kaijoList: <Kaijo>[Kaijo(name:"02", minute:04), Kaijo(name:"20", minute:08), Kaijo(name:"11", minute:09), Kaijo(name:"04", minute:17), Kaijo(name:"20", minute:18), Kaijo(name:"24", minute:24), Kaijo(name:"20", minute:28), Kaijo(name:"17", minute:29), Kaijo(name:"19", minute:29), Kaijo(name:"22", minute:32), Kaijo(name:"19", minute:38), Kaijo(name:"20", minute:38), Kaijo(name:"19", minute:47), Kaijo(name:"24", minute:52), Kaijo(name:"20", minute:56), Kaijo(name:"19", minute:57),]));
    timeTables.add(TimeTable(hour:17, kaijoList: <Kaijo>[Kaijo(name:"19", minute:09), Kaijo(name:"19", minute:18), Kaijo(name:"24", minute:20), Kaijo(name:"19", minute:27), Kaijo(name:"19", minute:37), Kaijo(name:"19", minute:47), Kaijo(name:"24", minute:48), Kaijo(name:"19", minute:57),]));
    timeTables.add(TimeTable(hour:18, kaijoList: <Kaijo>[Kaijo(name:"19", minute:07), Kaijo(name:"24", minute:17), Kaijo(name:"19", minute:26), Kaijo(name:"24", minute:46),]));
    timeTables.add(TimeTable(hour:19, kaijoList: <Kaijo>[Kaijo(name:"24", minute:15), Kaijo(name:"24", minute:45),]));
    timeTables.add(TimeTable(hour:20, kaijoList: <Kaijo>[Kaijo(name:"24", minute:15), Kaijo(name:"24", minute:44),]));
    super.initState();
  }
  @override
  Widget build(BuildContext context) {
    return DefaultTabController(
      length: 2,
      child: Scaffold(
        appBar: AppBar(
          title: Text('Tab Controller'),
          bottom: PreferredSize(
            child: TabBar(
              isScrollable: true,
              tabs: <Tab>[
                Tab(text: "aaa"),
                Tab(text: "bbb"),
              ],
            ),
            preferredSize: Size.fromHeight(30.0),
          ),
        ),
        body: TabBarView(children: <Widget>[
          _scheduleList(),
          _scheduleList(),
        ]),
      ),
    );
  }
  ListView _scheduleList(){
    return ListView(
      physics: BouncingScrollPhysics(),
      children: timeTables.map(_createExpansionPanel).toList(),
    );
  }
  Widget _createExpansionPanel(TimeTable timeTable){
    return Container(
      margin: EdgeInsets.symmetric(horizontal: 8.0, vertical: 4.0),
      padding: const EdgeInsets.all(0),
      child: ExpansionTile(
        title: Text(timeTable.hour.toString() + "時台"),
        children: timeTable.kaijoList.map((kaijo){
          return ListTile(
              trailing: Icon(Icons.arrow_forward_ios),
              title: Text(
                kaijo.name,
              ),
              subtitle: Text(
                  timeTable.hour.toString() + ":" + kaijo.minute.toString()
              )
          );
        }).toList(),
      ),
    );
  }


}

class TimeTable{
  int hour;
  List<Kaijo> kaijoList;
  bool isExpanded = false;
  TimeTable({this.hour, this.kaijoList});
}
class Kaijo{
  String name;
  int minute;
  Kaijo({this.name, this.minute});
}
