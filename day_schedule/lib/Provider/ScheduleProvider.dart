import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:day_schedule/Database/Schedule.dart';

class ScheduleProvider{
  static CollectionReference collection = Firestore.instance.collection("schedules");

  static Future<List<Schedule>> getSchedule(String documentId)async{
    DocumentSnapshot ds = await collection.document(documentId).get();
    List<Schedule> schedules = List<Schedule>();
    (ds.data["dataList"] as List).forEach((data){
      schedules.add(Schedule.fromMap(new Map<String, dynamic>.from(data)));
    });
    return schedules;
  }
}