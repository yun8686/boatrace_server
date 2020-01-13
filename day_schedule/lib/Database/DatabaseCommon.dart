import 'package:sqflite/sqflite.dart';

class DatabaseCommon{
  static const String TABLE_M_JCD = "M_JCD";
  static Future<Database> getDatabase()async{
    Database database = await openDatabase('mydata.db', version: 1,
        onCreate: (Database db, int version) async {
          // When creating the db, create the table
          await db.execute(
              'CREATE TABLE $TABLE_M_JCD '
                  '( jcd String PRIMARY KEY'
                  ', name String'
                  ');'
          );
        });
    return database;
  }
}