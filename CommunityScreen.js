import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
  doc,
  updateDoc,
  deleteDoc,
  arrayUnion,
  where,
  getCountFromServer,
} from 'firebase/firestore';
import { auth, db } from './firebaseConfig';
import { DARK_THEME } from './theme';

const ADMIN_EMAIL = 'hmdh67946@gmail.com';[span_9](start_span)[span_9](end_span)
const BAD_WORDS = ['كلب', 'حمار', 'غبي', 'خرا', 'زبالة', 'تافه'];[span_10](start_span)[span_10](end_span)
const AVATAR_COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FDCB6E', '#6C5CE7', '#E17055', '#00B894'];[span_11](start_span)[span_11](end_span)

function getAvatarColor(name = 'U') {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];[span_12](start_span)[span_12](end_span)
}

export default function CommunityScreen({ onBack, theme = DARK_THEME }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [onlineCount, setOnlineCount] = useState(0);
  const [userName, setUserName] = useState('متداول');[span_13](start_span)[span_13](end_span)
  const [isBanned, setIsBanned] = useState(false);
  const [sending, setSending] = useState(false);

  const scrollRef = useRef(null);
  const currentUser = auth.currentUser;
  const isAdmin = currentUser?.email === ADMIN_EMAIL;[span_14](start_span)[span_14](end_span)

  useEffect(() => {
    if (!currentUser) return;

    const unsubProfile = onSnapshot(doc(db, 'profiles', currentUser.uid), (snap) => {[span_15](start_span)[span_15](end_span)
      if (snap.exists()) {
        const d = snap.data();
        setUserName(d.full_name || 'متداول');[span_16](start_span)[span_16](end_span)
        if (d.banned_until && new Date() < d.banned_until.toDate()) {[span_17](start_span)[span_17](end_span)
          setIsBanned(true);
        }
      }
    });

    const qMsgs = query(collection(db, 'community_messages'), orderBy('created_at', 'asc'));[span_18](start_span)[span_18](end_span)
    const unsubMsgs = onSnapshot(qMsgs, (snap) => {
      const list = [];
      snap.forEach((docSnap) => {
        const m = { id: docSnap.id, ...docSnap.data() };
        list.push(m);
        if (m.user_id !== currentUser.uid && (!m.read_by || !m.read_by.includes(currentUser.uid))) {[span_19](start_span)[span_19](end_span)
          updateDoc(doc(db, 'community_messages', m.id), {
            read_by: arrayUnion(currentUser.uid),
          }).catch(() => {});
        }
      });
      setMessages(list);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 120);
    });

    const pingPresence = async () => {
      try {
        await updateDoc(doc(db, 'profiles', currentUser.uid), { last_seen: new Date() });[span_20](start_span)[span_20](end_span)
        const twoMinAgo = new Date(Date.now() - 2 * 60 * 1000);[span_21](start_span)[span_21](end_span)
        const qOnline = query(collection(db, 'profiles'), where('last_seen', '>=', twoMinAgo));[span_22](start_span)[span_22](end_span)
        const countSnap = await getCountFromServer(qOnline);[span_23](start_span)[span_23](end_span)
        setOnlineCount(countSnap.data().count);[span_24](start_span)[span_24](end_span)
      } catch (e) {
        setOnlineCount(1);[span_25](start_span)[span_25](end_span)
      }
    };

    pingPresence();
    const presenceTimer = setInterval(pingPresence, 30000);[span_26](start_span)[span_26](end_span)

    return () => {
      unsubProfile();
      unsubMsgs();
      clearInterval(presenceTimer);
    };
  }, [currentUser]);

  const handleSend = async () => {
    if (isBanned || !currentUser) return;
    const clean = text.trim();
    if (!clean) return;

    if (BAD_WORDS.some((w) => clean.includes(w))) {[span_27](start_span)[span_27](end_span)
      const banDate = new Date();
      banDate.setDate(banDate.getDate() + 3);[span_28](start_span)[span_28](end_span)
      await updateDoc(doc(db, 'profiles', currentUser.uid), { banned_until: banDate });[span_29](start_span)[span_29](end_span)
      setIsBanned(true);
      Alert.alert('تنبيه', 'لقد تم حظرك من الدردشة لمدة 3 أيام بسبب استخدام كلمات مسيئة.');[span_30](start_span)[span_30](end_span)
      return;
    }

    setSending(true);
    try {
      await addDoc(collection(db, 'community_messages'), {[span_31](start_span)[span_31](end_span)
        user_id: currentUser.uid,
        user_name: userName,
        text: clean,
        image_url: '',
        created_at: serverTimestamp(),
        reply_to: replyTo,
        read_by: [],
      });
      setText('');
      setReplyTo(null);
    } catch (e) {
      Alert.alert('خطأ', 'حدث خطأ أثناء إرسال الرسالة');[span_32](start_span)[span_32](end_span)
    } finally {
      setSending(false);
    }
  };

  const handleDelete = (id) => {
    Alert.alert('حذف الرسالة', 'هل أنت متأكد من حذف هذه الرسالة لدى الجميع؟', [[span_33](start_span)[span_33](end_span)
      { text: 'إلغاء', style: 'cancel' },
      {
        text: 'حذف',
        style: 'destructive',
        onPress: async () => {
          await deleteDoc(doc(db, 'community_messages', id));[span_34](start_span)[span_34](end_span)
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bgStart }]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>مجتمع المتداولين</Text>[span_35](start_span)[span_35](end_span)
          <Text style={styles.onlineText}>● {onlineCount} متصل الآن</Text>[span_36](start_span)[span_36](end_span)
        </View>
        {onBack && (
          <TouchableOpacity style={styles.backBtn} onPress={onBack}>
            <Text style={styles.backText}>→</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView ref={scrollRef} style={styles.chatArea} contentContainerStyle={styles.chatContent}>
        {messages.length === 0 ? (
          <Text style={styles.emptyText}>لا توجد رسائل بعد. كن أول من يتحدث!</Text>[span_37](start_span)[span_37](end_span)
        ) : (
          messages.map((msg) => {
            const isOwn = currentUser && msg.user_id === currentUser.uid;[span_38](start_span)[span_38](end_span)
            const canDelete = isOwn || isAdmin;[span_39](start_span)[span_39](end_span)
            const timeStr = msg.created_at?.seconds
              ? new Date(msg.created_at.seconds * 1000).toLocaleTimeString('ar-EG', {
                  hour: '2-digit',
                  minute: '2-digit',
                })[span_40](start_span)[span_40](end_span)
              : '';

            return (
              <View key={msg.id} style={[styles.msgRow, isOwn && styles.ownRow]}>
                <View style={[styles.avatar, { backgroundColor: getAvatarColor(msg.user_name) }]}>
                  <Text style={styles.avatarLetter}>{(msg.user_name || 'U').trim().charAt(0).toUpperCase()}</Text>[span_41](start_span)[span_41](end_span)
                </View>

                <View style={[styles.bubbleWrap, isOwn && { alignItems: 'flex-end' }]}>
                  {!isOwn && <Text style={styles.senderName}>{msg.user_name || 'متداول'}</Text>}[span_42](start_span)[span_42](end_span)

                  <TouchableOpacity
                    activeOpacity={0.85}
                    style={[styles.bubble, isOwn && styles.ownBubble]}
                    onLongPress={() =>
                      setReplyTo({ id: msg.id, name: msg.user_name || 'متداول', text: msg.text || 'صورة' })[span_43](start_span)[span_43](end_span)
                    }
                  >
                    {msg.reply_to ? (
                      <View style={styles.quoteBox}>
                        <Text style={styles.quoteAuthor}>{msg.reply_to.name}</Text>
                        <Text style={styles.quoteText}>{msg.reply_to.text}</Text>
                      </View>
                    ) : null}
                    {msg.text ? <Text style={styles.msgText}>{msg.text}</Text> : null}
                  </TouchableOpacity>

                  <View style={styles.metaRow}>
                    {canDelete && (
                      <TouchableOpacity onPress={() => handleDelete(msg.id)}>
                        <Text style={styles.delBtn}>حذف</Text>
                      </TouchableOpacity>
                    )}
                    <Text style={styles.timeText}>{timeStr}</Text>
                    {isOwn && (
                      <Text style={{ color: msg.read_by?.length ? '#0A84FF' : '#9CA3AF', fontSize: 11 }}>
                        {msg.read_by?.length ? '✓✓' : '✓'}[span_44](start_span)[span_44](end_span)
                      </Text>
                    )}
                  </View>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      {replyTo && (
        <View style={styles.replyBar}>
          <View style={{ flex: 1 }}>
            <Text style={styles.replyAuthor}>الرد على: {replyTo.name}</Text>[span_45](start_span)[span_45](end_span)
            <Text numberOfLines={1} style={styles.replySnippet}>
              {replyTo.text}
            </Text>
          </View>
          <TouchableOpacity onPress={() => setReplyTo(null)}>
            <Text style={{ color: '#EF4444', fontWeight: '800', fontSize: 16 }}>✕</Text>
          </TouchableOpacity>
        </View>
      )}

      {isBanned ? (
        <View style={styles.banBox}>
          <Text style={styles.banText}>
            لقد تم حظرك من الدردشة لمدة 3 أيام بسبب استخدام كلمات مسيئة أو صور غير أخلاقية.[span_46](start_span)[span_46](end_span)
          </Text>
        </View>
      ) : (
        <View style={styles.inputBar}>
          <TextInput
            style={styles.input}
            placeholder="اكتب رسالتك هنا...[span_47](start_span)"[span_47](end_span)
            placeholderTextColor="#6B7280"
            value={text}
            onChangeText={setText}
          />
          <TouchableOpacity style={styles.sendBtn} onPress={handleSend} disabled={sending}>
            {sending ? <ActivityIndicator color="#FFF" size="small" /> : <Text style={styles.sendText}>➤</Text>}
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  title: { color: '#FFF', fontSize: 19, fontWeight: '900' },
  onlineText: { color: '#10B981', fontSize: 12, fontWeight: '700', marginTop: 3 },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.06)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backText: { color: '#FFF', fontSize: 18, fontWeight: '700' },
  chatArea: { flex: 1 },
  chatContent: { padding: 18, gap: 14, paddingBottom: 24 },
  emptyText: { color: '#9CA3AF', textAlign: 'center', marginTop: 24, fontSize: 13 },
  msgRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 10 },
  ownRow: { flexDirection: 'row-reverse' },
  avatar: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  avatarLetter: { color: '#FFF', fontSize: 15, fontWeight: '900' },
  bubbleWrap: { maxWidth: '75%' },
  senderName: { color: '#9CA3AF', fontSize: 11, fontWeight: '700', marginBottom: 4 },
  bubble: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  ownBubble: {
    backgroundColor: 'rgba(10, 132, 255, 0.18)',
    borderColor: 'rgba(10, 132, 255, 0.35)',
  },
  quoteBox: {
    backgroundColor: 'rgba(0,0,0,0.25)',
    borderRightWidth: 3,
    borderRightColor: '#0A84FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 6,
  },
  quoteAuthor: { color: '#0A84FF', fontSize: 10, fontWeight: '800' },
  quoteText: { color: '#9CA3AF', fontSize: 11 },
  msgText: { color: '#FFF', fontSize: 14, lineHeight: 20, textAlign: 'right' },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  delBtn: { color: '#EF4444', fontSize: 11, fontWeight: '700' },
  timeText: { color: '#9CA3AF', fontSize: 10 },
  replyBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(10, 132, 255, 0.12)',
    borderRightWidth: 3,
    borderRightColor: '#0A84FF',
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginHorizontal: 16,
    borderRadius: 10,
  },
  replyAuthor: { color: '#0A84FF', fontSize: 11, fontWeight: '800', textAlign: 'right' },
  replySnippet: { color: '#FFF', fontSize: 12, textAlign: 'right' },
  banBox: {
    margin: 14,
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  banText: { color: '#EF4444', fontSize: 12, textAlign: 'center' },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
  input: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 11,
    color: '#FFF',
    fontSize: 14,
    textAlign: 'right',
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#0A84FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendText: { color: '#FFF', fontSize: 16, fontWeight: '800' },
});
