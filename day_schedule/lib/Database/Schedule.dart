
import 'package:sqflite/sqflite.dart';

import 'DatabaseCommon.dart';

class Schedule{
  String jcd;
  String jouname;
  String days;
  List<TimeList> timeList;
  Schedule({this.jcd, this.jouname, this.days, this.timeList});
  Schedule.fromMap(Map<String, dynamic> map){
    this.jcd = map["jcd"];
    this.jouname = map["jouname"];
    this.days = map["days"];
    this.timeList = (map["timeList"] as List).map((time){
      print(time["oddsData"]);
      String min_oddpth = "",min_odds = "",min_oddpth2 = "",min_odds2 = "";
      if(time["oddsData"] != null){
        min_oddpth = time["oddsData"]["min_oddpth"];
        min_odds = time["oddsData"]["min_odds"].toString();
        min_oddpth2 = time["oddsData"]["min_oddpth2"];
        min_odds2 = time["oddsData"]["min_odds2"].toString();
      }
      return TimeList(
        raceno: time["raceno"],
        rno: time["rno"],
        time: time["time"],
        info: time["info"],
        info2: "一番人気: $min_oddpth ($min_odds倍), $min_oddpth2 ($min_odds2倍)",
      );
    }).toList();
  }
}

class TimeList{
  String time;
  String raceno;
  String rno;
  int hour, minute;
  String info,info2;
  TimeList({this.time, this.raceno, this.rno, this.info, this.info2}){
    this.hour = int.parse(this.time.split(":")[0]);
    this.minute = int.parse(this.time.split(":")[1]);
  }
}