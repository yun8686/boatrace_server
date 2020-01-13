
import 'package:sqflite/sqflite.dart';

import 'DatabaseCommon.dart';

class Mjcd{
  String jcd;
  String name;
  Mjcd({this.jcd, this.name});

  static Future<void> insert(List<Mjcd> jcdList)async{
    Database database = await DatabaseCommon.getDatabase();
    jcdList.forEach((jcd)async{
      await database.insert(DatabaseCommon.TABLE_M_JCD,{
        "jcd":jcd.jcd,
        "name": jcd.name,
      });
    });
  }

  static Future<List<Mjcd>> select()async{
    Database database = await DatabaseCommon.getDatabase();
    List<Map> list = await database.rawQuery("select * from " + DatabaseCommon.TABLE_M_JCD + ";" );
    return list.map((data){
      print(data);
      return Mjcd(
        jcd: data["jcd"].toString().padLeft(2, "0"),
        name: data["name"],
      );
    }).toList();

  }
}