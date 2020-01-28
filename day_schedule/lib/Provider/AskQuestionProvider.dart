import 'package:cloud_firestore/cloud_firestore.dart';

class AskQuestionProvider{
  static CollectionReference collection = Firestore.instance.collection("ask_question");

  static Future<bool> addMessage(String message)async{
    await collection.add({
      "message": message,
    });
    return true;
  }
}