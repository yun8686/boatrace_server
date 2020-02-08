
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
      String min_oddpth = "",min_odds = "",min_oddpth2 = "",min_odds2 = "";
      if(time["oddsData"] != null){
        min_oddpth = time["oddsData"]["min_oddpth"];
        min_odds = time["oddsData"]["min_odds"].toString();
        min_oddpth2 = time["oddsData"]["min_oddpth2"];
        min_odds2 = time["oddsData"]["min_odds2"].toString();
      }
      String result2 = "", result2_amt = "", result2_rank = "",
             result3 = "", result3_amt = "", result3_rank = "";
      if(time["resultData"] != null && time["resultData"]["result2"] != null){
        result2 = time["resultData"]["result2"];
        result2_amt = time["resultData"]["result2_amt"];
        result2_rank = time["resultData"]["result2_rank"];
        result3 = time["resultData"]["result3"];
        result3_amt = time["resultData"]["result3_amt"];
        result3_rank = time["resultData"]["result3_rank"];
      }
      return TimeList(
        raceno: time["raceno"],
        rno: time["rno"],
        time: time["time"],
        info: time["info"],
        info2: "一番人気: $min_oddpth ($min_odds倍), $min_oddpth2 ($min_odds2倍)",
        info3: result2.length > 0?
          "結果: $result3 2連単$result2_amt($result2_rank), 3連単$result3_amt($result3_rank), ":null,
      );
    }).toList();
  }
}

class TimeList{
  String time;
  String raceno;
  String rno;
  int hour, minute;
  String info,info2, info3;
  TimeList({this.time, this.raceno, this.rno, this.info, this.info2, this.info3}){
    this.hour = int.parse(this.time.split(":")[0]);
    this.minute = int.parse(this.time.split(":")[1]);
  }
}