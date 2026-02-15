// Firebase Consoleで実行するスクリプト
// 
// 手順：
// 1. Firebase Console にアクセス
// 2. Firestore Database を開く
// 3. users コレクションを開く
// 4. test9@test.com のユーザードキュメントを探す
// 5. role フィールドを "admin" に変更
//
// または、以下のコマンドをFirebase CLIで実行：

const admin = require('firebase-admin');
admin.initializeApp();

async function makeAdmin(email) {
  const usersRef = admin.firestore().collection('users');
  const snapshot = await usersRef.where('email', '==', email).get();
  
  if (snapshot.empty) {
    console.log('ユーザーが見つかりません');
    return;
  }
  
  const userId = snapshot.docs[0].id;
  await usersRef.doc(userId).update({
    role: 'admin'
  });
  
  console.log(`${email} を管理者に設定しました`);
}

// 実行
makeAdmin('test9@test.com');
