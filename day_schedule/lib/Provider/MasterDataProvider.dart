import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:day_schedule/Database/Mjcd.dart';


class MasterDataProvider {
  static CollectionReference collection = Firestore.instance.collection("masterData");
  static Map<String, String> _jcdmap;

  static Future<Map<String, String>> getJcdMap()async{
    if(_jcdmap == null){
      _jcdmap = new Map<String, String>();
      List<Mjcd> dblist = await Mjcd.select();
      if(dblist.length > 0){
        print("fromDB");
        print(dblist);
        dblist.forEach((data){
          _jcdmap[data.jcd] = data.name;
        });
      }else{
        DocumentSnapshot ds = await collection.document("data").get();
        _jcdmap = new Map<String,String>.from(ds.data["jcdmap"]);
        _jcdmap.forEach((key,value){
          dblist.add(Mjcd(jcd: key, name: value));
        });
        await Mjcd.insert(dblist);
      }
    }
    return _jcdmap;
  }

}

