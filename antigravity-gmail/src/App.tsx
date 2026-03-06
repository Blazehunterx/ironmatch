import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  CheckCircle2,
  Search,
  Menu,
  ChevronRight,
  Zap,
  LogOut,
  Anchor,
  Skull,
  Coffee,
  Sword,
  Compass,
  Hammer,
  Send,
  Activity,
  X,
  Paperclip,
  Trash2,
  Reply,
  Users,
  RefreshCw,
  ArrowDownCircle,
  Terminal
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGoogleLogin, googleLogout } from '@react-oauth/google';
import { gmailService } from './gmailService';
import { antigravityAI, type AISuggestion, type ReportShift, type SmartLabel, smartLabelColors } from './antigravityAI';
import { contactIntelligence, type ContactProfile } from './contactIntelligence';

// --- Types ---
interface Email {
  id: string;
  threadId: string;
  from: string;
  fromEmail: string;
  to: string;
  cc: string;
  subject: string;
  snippet: string;
  body: string;
  date: string;
  rawDate: string;
  category: 'Action Required' | 'Awaiting Response' | 'Low Priority';
  read: boolean;
  isNoise?: boolean;
  triageReason?: string;
  smartLabel?: SmartLabel;
  attachments?: { id: string; name: string; size: string }[];
}

interface FollowUp {
  threadId: string;
  to: string;
  subject: string;
  sentAt: string;
  remindAt: string;
  dismissed: boolean;
}

interface ChatMessage {
  id: string;
  text: string;
  sender: 'User' | 'AI';
  timestamp: Date;
  action?: any;
}

const HakiBolt: React.FC<{ active: boolean }> = ({ active }) => (
  <AnimatePresence>
    {active && (
      <>
        {[...Array(4)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="haki-bolt"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              height: `${20 + Math.random() * 40}px`,
              animationDelay: `${Math.random() * 0.5}s`
            }}
          />
        ))}
      </>
    )}
  </AnimatePresence>
);

const App: React.FC = () => {
  const [accessToken, setAccessToken] = useState<string | null>(localStorage.getItem('gmail_token'));
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [showAI, setShowAI] = useState(true);
  const [activeTab, setActiveTab] = useState('Navigator (Inbox)');
  const [showCompose, setShowCompose] = useState(false);
  const [sending, setSending] = useState(false);
  const [composeData, setComposeData] = useState({ to: '', cc: '', subject: '', body: '' });
  const [aiSuggestion, setAiSuggestion] = useState<AISuggestion | null>(null);
  const [selectedTacticIndex, setSelectedTacticIndex] = useState<number>(1); // Default to Swordsman
  const [hakiIntel, setHakiIntel] = useState<string | null>(null);
  const [allies, setAllies] = useState<{ name: string, count: number }[]>([]);
  const [manualAllies, setManualAllies] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem('hakimail_allies');
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch { return new Set(); }
  });
  const [hakiReport, setHakiReport] = useState<string | null>(null);
  const [showReport, setShowReport] = useState(false);
  const [nextPageToken, setNextPageToken] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [manualUnimportant, setManualUnimportant] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem('hakimail_rogues');
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch { return new Set(); }
  });
  const [threadMessages, setThreadMessages] = useState<any[]>([]);
  const [repliedThreads, setRepliedThreads] = useState<Set<string>>(new Set());
  const [followUps, setFollowUps] = useState<FollowUp[]>(() => {
    try {
      const stored = localStorage.getItem('hakimail_followups');
      return stored ? JSON.parse(stored) : [];
    } catch { return []; }
  });
  const [contactProfiles, setContactProfiles] = useState<Record<string, ContactProfile>>({});
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('hakimail_chat');
    return saved ? JSON.parse(saved).map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) })) : [];
  });
  const [chatInput, setChatInput] = useState('');
  const [isAIProcessing, setIsAIProcessing] = useState(false);

  const login = useGoogleLogin({
    onSuccess: (tokenResponse) => {
      localStorage.setItem('gmail_token', tokenResponse.access_token);
      setAccessToken(tokenResponse.access_token);
    },
    scope: 'https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.modify https://www.googleapis.com/auth/gmail.compose',
  });

  const toggleManualAlly = (email: string) => {
    setManualAllies(prev => {
      const next = new Set(prev);
      if (next.has(email)) next.delete(email);
      else {
        next.add(email);
        // Remove from unimportant if moving to ally
        setManualUnimportant(p => {
          const n = new Set(p);
          n.delete(email);
          return n;
        });
      }
      return next;
    });
  };

  const toggleManualUnimportant = (email: string) => {
    setManualUnimportant(prev => {
      const next = new Set(prev);
      if (next.has(email)) next.delete(email);
      else {
        next.add(email);
        // Remove from allies if moving to unimportant
        setManualAllies(p => {
          const n = new Set(p);
          n.delete(email);
          return n;
        });
      }
      return next;
    });
  };

  const logout = () => {
    googleLogout();
    localStorage.removeItem('gmail_token');
    setAccessToken(null);
  };

  useEffect(() => {
    if (accessToken) {
      fetchEmails();
      fetchContacts();
    }
  }, [accessToken]);

  useEffect(() => {
    localStorage.setItem('hakimail_allies', JSON.stringify(Array.from(manualAllies)));
  }, [manualAllies]);

  useEffect(() => {
    localStorage.setItem('hakimail_rogues', JSON.stringify(Array.from(manualUnimportant)));
  }, [manualUnimportant]);

  useEffect(() => {
    antigravityAI.syncManualClassifications(manualAllies, manualUnimportant);
  }, [manualAllies, manualUnimportant]);

  const fetchContacts = async () => {
    if (!accessToken) return;
    try {
      const sent = await gmailService.listSentMessages(accessToken, 50);
      const details = await Promise.all(sent.map((msg: any) => gmailService.getMessage(accessToken, msg.id)));

      // --- Style Learning Protocol ---
      await antigravityAI.learnFromSentSignals(details);

      const counts: Record<string, number> = {};
      details.forEach(item => {
        const headers = gmailService.parseHeaders(item);
        const to = headers.from;
        if (to) {
          counts[to] = (counts[to] || 0) + 1;
        }
      });

      const sorted = Object.entries(counts)
        .map(([name, count]) => ({ name: name.split('<')[0].trim(), count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      setAllies(sorted);
    } catch (e) {
      console.error("Error fetching contacts:", e);
    }
  };

  const handleRefresh = () => fetchEmails(false);
  const handleLoadMore = () => fetchEmails(true);

  // Fetch thread messages when an email is selected
  useEffect(() => {
    const fetchThread = async () => {
      if (selectedEmail && accessToken && selectedEmail.threadId) {
        try {
          const thread = await gmailService.getThread(accessToken, selectedEmail.threadId);
          const msgs = (thread.messages || []).map((msg: any) => {
            const headers = gmailService.parseHeaders(msg);
            const fromHeader = headers.from || '';
            const fromName = fromHeader.split('<')[0].trim().replace(/"/g, '');
            const body = gmailService.parseBody(msg.payload);
            const date = headers.date ? new Date(headers.date) : new Date();
            const isSent = (msg.labelIds || []).includes('SENT');
            return { id: msg.id, from: fromName, body, date, isSent };
          });
          setThreadMessages(msgs);
        } catch (e) {
          console.error('Error fetching thread:', e);
          setThreadMessages([]);
        }
      } else {
        setThreadMessages([]);
      }
    };
    fetchThread();
  }, [selectedEmail, accessToken]);

  useEffect(() => {
    const getAiSuggestion = async () => {
      if (selectedEmail && showAI) {
        const suggestion = await antigravityAI.analyzeEmail(
          selectedEmail.subject,
          selectedEmail.snippet,
          selectedEmail.from,
          selectedEmail.body
        );
        setAiSuggestion(suggestion);

        const intel = await antigravityAI.researchContext(selectedEmail.body);
        setHakiIntel(intel);
      }
    };
    getAiSuggestion();
  }, [selectedEmail, showAI]);

  const fetchEmails = async (loadMore = false) => {
    if (!accessToken) return;
    if (loadMore && !nextPageToken) return;

    setLoading(true);
    if (!loadMore) setIsRefreshing(true);

    try {
      const result = await gmailService.listMessages(accessToken, 25, (loadMore && nextPageToken) ? nextPageToken : undefined, 'label:INBOX');
      const messages = result.messages;
      setNextPageToken(result.nextPageToken);

      const emailDetails = await Promise.all(
        messages.map((msg: any) => gmailService.getMessage(accessToken, msg.id))
      );

      const mappedEmails: Email[] = emailDetails.map(item => {
        const headers = gmailService.parseHeaders(item);
        const subject = headers.subject || '(No Subject)';
        const snippet = item.snippet || '';
        const fromHeader = headers.from || '';
        const fromEmail = fromHeader.match(/<(.+)>/)?.[1] || fromHeader;
        const fromName = fromHeader.split('<')[0].trim().replace(/"/g, '');
        const isAlly = allies.some(a => a.name === fromName) || manualAllies.has(fromEmail);

        let category: 'Action Required' | 'Awaiting Response' | 'Low Priority' = 'Low Priority';

        // --- Observation Haki (Urgency Vectors) ---
        const urgencyKeywords = ['urgent', 'action', 'asap', 'deadline', 'immediately', 'important', '!', '?', 'payment', 'invoice'];
        const isUrgent = urgencyKeywords.some(kw =>
          subject.toLowerCase().includes(kw) ||
          snippet.toLowerCase().includes(kw)
        );

        if (isUrgent || isAlly) {
          category = 'Action Required';
        } else if (subject.toLowerCase().includes('re:') || subject.toLowerCase().includes('fwd:')) {
          category = 'Awaiting Response';
        }

        const attachments = item.payload.parts?.filter((part: any) => part.filename && part.filename.length > 0)
          .map((part: any) => ({
            id: part.body.attachmentId,
            name: part.filename,
            size: part.body.size
          })) || [];

        const body = gmailService.parseBody(item.payload);
        const triage = antigravityAI.triageSignal(subject, snippet, body, fromEmail);
        const smartLabel = antigravityAI.categorizeEmail(subject, body, fromEmail);

        return {
          id: item.id,
          threadId: item.threadId || '',
          from: fromName,
          fromEmail,
          to: headers.to || '',
          cc: headers.cc || '',
          subject,
          date: headers.date ? new Date(headers.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
          rawDate: headers.date || '',
          snippet,
          body,
          category,
          read: !item.labelIds.includes('UNREAD'),
          isNoise: triage.isNoise,
          triageReason: triage.reason,
          smartLabel,
          attachments
        };
      }).filter(() => true);

      // Precision filtering: Only include signals with identifying INBOX signatures
      const newInboxEmails = emailDetails.filter(msg => msg.labelIds.includes('INBOX'))
        .map(msg => mappedEmails.find(e => e.id === msg.id))
        .filter((e): e is Email => !!e);

      setEmails(prev => loadMore ? [...prev, ...newInboxEmails] : newInboxEmails);

      // Build contact intelligence profiles
      const allEmails = loadMore ? [...emails, ...newInboxEmails] : newInboxEmails;
      const inboxData = allEmails.map(e => ({ from: e.from, fromEmail: e.fromEmail, date: e.rawDate, subject: e.subject, body: e.body }));
      const store = contactIntelligence.buildProfiles(inboxData, []);
      setContactProfiles(store.profiles);

      // --- Intelligence Report Protocol ---
      const hour = new Date().getHours();
      const currentShift: ReportShift = hour < 12 ? 'Morning' : hour < 18 ? 'Afternoon' : 'Evening';
      const report = antigravityAI.generateHakiReport(loadMore ? [...emails, ...newInboxEmails] : newInboxEmails, currentShift);
      setHakiReport(report);

      if (newInboxEmails.length > 0 && !selectedEmail) {
        setSelectedEmail(newInboxEmails[0]);
      }
    } catch (error) {
      console.error('Error fetching emails:', error);
      if ((error as any).response?.status === 401) logout();
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleTrash = async (messageId: string) => {
    if (!accessToken) return;
    try {
      await gmailService.trashMessage(accessToken, messageId);
      setEmails(emails.filter(e => e.id !== messageId));
      if (selectedEmail?.id === messageId) setSelectedEmail(null);
      alert("Signal Purged! Message moved to the deep trash.");
    } catch (e) {
      console.error("Error trashing:", e);
    }
  };

  const handleBulkArchive = async () => {
    if (!accessToken) return;
    const noise = emails.filter(e => e.isNoise);
    if (noise.length === 0) {
      alert("Grand Line is clear! No noise detected in this sector.");
      return;
    }

    setLoading(true);
    try {
      await Promise.all(noise.map(e => gmailService.archiveMessage(accessToken, e.id)));
      await fetchEmails();
      alert(`// PURGE COMPLETE: ${noise.length} signals archived. Focus Restored.`);
    } catch (e) {
      console.error("Bulk archive failed:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (to: string, subject: string, body: string, threadId?: string, cc?: string) => {
    if (!accessToken) return;
    setSending(true);
    try {
      await gmailService.sendMessage(accessToken, to, subject, body, threadId, cc);
      setShowCompose(false);
      setComposeData({ to: '', cc: '', subject: '', body: '' });

      // Track replied threads so category stays downgraded
      if (threadId) {
        setRepliedThreads(prev => {
          const next = new Set(prev);
          next.add(threadId);
          return next;
        });

        // Downgrade immediately in the email list
        setEmails(prev => prev.map(e =>
          e.threadId === threadId ? { ...e, category: 'Awaiting Response' as const } : e
        ));

        // Wait 2 seconds for Gmail to index the sent message, then re-fetch thread
        setTimeout(async () => {
          try {
            const thread = await gmailService.getThread(accessToken, threadId);
            const msgs = (thread.messages || []).map((msg: any) => {
              const headers = gmailService.parseHeaders(msg);
              const fromHeader = headers.from || '';
              const fromName = fromHeader.split('<')[0].trim().replace(/"/g, '');
              const msgBody = gmailService.parseBody(msg.payload);
              const date = headers.date ? new Date(headers.date) : new Date();
              const isSent = (msg.labelIds || []).includes('SENT');
              return { id: msg.id, from: fromName, body: msgBody, date, isSent };
            });
            setThreadMessages(msgs);
          } catch (e) {
            console.error('Error refreshing thread:', e);
          }
        }, 2000);

        // Auto-create follow-up reminder (3-day default)
        const newFollowUp: FollowUp = {
          threadId,
          to,
          subject,
          sentAt: new Date().toISOString(),
          remindAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
          dismissed: false
        };
        setFollowUps(prev => {
          const updated = [...prev.filter(f => f.threadId !== threadId), newFollowUp];
          localStorage.setItem('hakimail_followups', JSON.stringify(updated));
          return updated;
        });
      }

      alert("Burst Executed! Signal sent across the Grand Line.");
    } catch (error) {
      console.error('Error sending email:', error);
      alert("Burst Failed! Check your Haki connection.");
    } finally {
    }
  };

  const executeAICommand = (command: any) => {
    switch (command.type) {
      case 'draft':
        setComposeData({
          to: command.payload.to || '',
          cc: '',
          subject: command.payload.subject || '',
          body: command.payload.body || '',
          originalBody: '',
          threadId: undefined
        } as any);
        setShowCompose(true);
        break;
      case 'purge':
        handleBulkArchive();
        break;
      case 'align':
        toggleManualAlly(command.payload.email);
        break;
      default:
        console.warn('Unknown AI command:', command.type);
    }
  };

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isAIProcessing) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      text: chatInput,
      sender: 'User',
      timestamp: new Date()
    };

    setChatMessages(prev => {
      const updated = [...prev, userMsg];
      localStorage.setItem('hakimail_chat', JSON.stringify(updated));
      return updated;
    });
    setChatInput('');
    setIsAIProcessing(true);

    try {
      const response = await antigravityAI.processCommand(chatInput, {
        emails,
        allies,
        contactProfiles
      });

      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: response.text,
        sender: 'AI',
        timestamp: new Date(),
        action: response.action
      };

      setChatMessages(prev => {
        const updatedMessages = [...prev, aiMsg];
        localStorage.setItem('hakimail_chat', JSON.stringify(updatedMessages));
        return updatedMessages;
      });

      if (response.action) {
        setTimeout(() => executeAICommand(response.action), 1000);
      }
    } catch (err) {
      console.error('AI Processing Error:', err);
    } finally {
      setIsAIProcessing(false);
    }
  };

  useEffect(() => {
    if (chatMessages.length === 0) {
      setChatMessages([{
        id: 'init',
        text: "Commander Antigravity standing by, Captain. The Grand Line of your inbox is vast—how shall we navigate today? You can ask me to draft emails, purge noise, or provide a status report.",
        sender: 'AI',
        timestamp: new Date()
      }]);
    }
  }, []);

  const navItems = [
    { name: 'Commander', icon: Terminal, active: activeTab === 'Commander' },
    { name: 'Navigator (Inbox)', icon: Compass, active: activeTab === 'Navigator (Inbox)' },
    { name: 'Swordsman (Priority)', icon: Sword, active: activeTab === 'Swordsman (Priority)' },
    { name: 'Cook (Drafts)', icon: Coffee, active: activeTab === 'Cook (Drafts)' },
    { name: 'Shipwright (Allies)', icon: Hammer, active: activeTab === 'Shipwright (Allies)' },
    { name: 'Log Pose', icon: Anchor, active: activeTab === 'Log Pose' },
  ];

  const getDomain = (from: string) => {
    const match = from.match(/@([^>]+)/);
    // Strip trailing > if it exists
    return match ? match[1].replace('>', '').trim() : null;
  };

  const processedEmails = React.useMemo(() => {
    const enriched = emails.map(email => {
      let category = email.category;

      // If this thread has been replied to, force 'Awaiting Response'
      if (repliedThreads.has(email.threadId)) {
        category = 'Awaiting Response';
      } else {
        // Re-calculate category based on LATEST manualAllies and manualUnimportant
        const emailAddr = email.from.match(/<(.+)>/)?.[1] || email.from;
        const isAlly = manualAllies.has(email.from) || manualAllies.has(emailAddr);
        const isUnimportant = manualUnimportant.has(email.from) || manualUnimportant.has(emailAddr);

        if (isAlly) {
          category = 'Action Required';
        } else if (isUnimportant) {
          category = 'Low Priority';
        }
      }

      return { ...email, category };
    });

    return enriched.filter(email => {
      if (activeTab === 'Shipwright (Allies)') return true;
      if (activeTab === 'Swordsman (Priority)') return email.category === 'Action Required';
      if (activeTab === 'Cook (Drafts)') return false;
      if (activeTab === 'Log Pose') return false;
      if (activeTab === 'Jolly Roger') return email.category === 'Action Required';
      if (activeTab === 'Blackbeard') return email.category === 'Low Priority';
      return true;
    }).sort((a, b) => {
      // Sort by rawDate (newest first)
      const dateA = new Date(a.rawDate).getTime();
      const dateB = new Date(b.rawDate).getTime();
      return dateB - dateA;
    });
  }, [emails, manualAllies, manualUnimportant, activeTab, repliedThreads]);

  if (!accessToken) {
    return (
      <div className="h-screen haki-deck flex items-center justify-center p-6 text-center text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-haki-red/5 to-transparent pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full haki-card p-12 border-haki-red/10 shadow-[0_0_80px_rgba(0,0,0,0.5)]"
        >
          <div className="w-40 h-40 mx-auto mb-10 relative group">
            <div className="absolute inset-0 bg-haki-red/20 blur-[50px] rounded-full animate-pulse" />
            <img
              src="/cyber-luffy.png"
              alt="Haki Mail"
              className="w-full h-full object-contain relative z-20 group-hover:scale-105 transition-transform duration-500 drop-shadow-[0_0_20px_#E61E2A]"
            />
          </div>

          <h1 className="text-5xl font-black uppercase italic mb-4 font-mono tracking-tighter text-white">
            HAKI<span className="text-haki-red">MAIL</span>
          </h1>
          <p className="text-slate-500 text-[10px] font-black mb-12 uppercase tracking-[0.4em] font-mono">
            Conquering the Digital Sea
          </p>

          <button
            onClick={() => login()}
            className="haki-btn-primary w-full flex items-center justify-center gap-4"
          >
            <Zap size={20} fill="currentColor" />
            Join the Fleet
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex h-screen haki-deck overflow-hidden text-white font-sans selection:bg-haki-red/30">

      {/* Sidebar - Haki Command Module */}
      <aside className="w-20 md:w-64 bg-haki-obsidian border-r border-white/5 flex flex-col items-center md:items-stretch py-8 px-4 relative z-50">
        <div className="absolute right-0 top-0 bottom-0 w-[1px] bg-haki-red/10" />

        <div className="flex items-center gap-3 px-3 mb-8 group cursor-pointer">
          <div className="w-10 h-10 rounded-xl bg-haki-slate border border-white/10 flex items-center justify-center p-1.5 transition-all group-hover:border-haki-red/50 duration-500 overflow-hidden shadow-2xl">
            <img src="/cyber-luffy.png" alt="Icon" className="w-full h-full object-contain opacity-60 group-hover:opacity-100 transition-opacity" />
          </div>
          <div className="hidden md:block">
            <h1 className="text-lg font-black tracking-tighter uppercase italic font-mono leading-tight">
              HAKI<span className="text-haki-red">MAIL</span>
            </h1>
            <span className="text-[8px] font-black text-slate-600 uppercase tracking-[0.4em] block mt-0.5">Conqueror Edition</span>
          </div>
        </div>

        <div className="px-1.5 mb-8 hidden md:block text-center">
          <button
            onClick={() => {
              setComposeData({ to: '', cc: '', subject: '', body: '' });
              setShowCompose(true);
            }}
            className="haki-btn-primary w-full py-3 flex items-center justify-center gap-2 text-[10px]"
          >
            <Zap size={14} fill="currentColor" />
            NEW SIGNAL
          </button>
        </div>

        {/* Scrollable Command Center */}
        <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col min-h-0">
          <nav className="space-y-1.5 px-1.5 mb-8">
            {navItems.map((item) => (
              <button
                key={item.name}
                onClick={() => setActiveTab(item.name)}
                className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 group relative
                  ${item.active ? 'bg-haki-red/10 text-haki-red' : 'text-slate-500 hover:text-white hover:bg-white/5'} `}
              >
                {item.active && (
                  <motion.div layoutId="crewSelection" className="absolute left-0 top-1.5 bottom-1.5 w-0.5 bg-haki-red rounded-full shadow-[0_0_15px_#E61E2A]" />
                )}
                <item.icon size={16} className={item.active ? 'text-haki-red' : 'group-hover:text-haki-red transition-colors'} />
                <span className="hidden md:block text-[9px] font-black uppercase tracking-[0.15em] font-mono">{item.name}</span>
              </button>
            ))}
          </nav>

          {/* Urgency Heatmap - Tactical Overview */}
          <div className="px-6 mb-8">
            <h3 className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-600 mb-4 font-mono">Urgency Heatmap</h3>
            <div className="flex gap-1 h-12 items-end">
              {processedEmails.slice(0, 15).map((email, i) => {
                const height = email.category === 'Action Required' ? 'h-12' : email.category === 'Awaiting Response' ? 'h-6' : 'h-3';
                const color = email.category === 'Action Required' ? 'bg-haki-red shadow-[0_0_10px_#E61E2A]' : email.category === 'Awaiting Response' ? 'bg-slate-600' : 'bg-slate-800';
                return (
                  <div
                    key={i}
                    className={`flex-1 ${height} ${color} rounded-sm transition-all duration-500 hover:scale-125 cursor-pointer`}
                    title={`${email.from}: ${email.category}`}
                    onClick={() => setSelectedEmail(email)}
                  />
                );
              })}
            </div>
            <p className="text-[7px] font-black text-slate-700 uppercase mt-4 font-mono tracking-widest text-center">Live Signal Density</p>
          </div>

          {/* Intelligence Brief Trigger */}
          <div className="px-6 mb-8">
            <button
              onClick={() => setShowReport(true)}
              className="w-full haki-card bg-haki-slate/40 border-haki-red/10 p-4 flex items-center justify-between group hover:border-haki-red/30 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-haki-red/10 flex items-center justify-center">
                  <Sparkles size={16} className="text-haki-red" />
                </div>
                <div className="text-left">
                  <span className="text-[9px] font-black text-white group-hover:text-haki-red transition-colors block uppercase tracking-widest font-mono">Haki Brief</span>
                  <span className="text-[7px] text-slate-500 block uppercase font-mono italic">Sector Intel</span>
                </div>
              </div>
              <ChevronRight size={12} className="text-slate-700 group-hover:text-haki-red transition-all" />
            </button>
          </div>
        </div>

        <div className="mt-auto px-2">
          <div className="p-8 haki-card md:block hidden haki-aura-crimson overflow-hidden">
            <div className="flex items-center justify-between mb-5 relative z-10">
              <div className="flex items-center gap-3">
                <Skull size={18} className="text-haki-red" />
                <span className="text-[9px] uppercase font-black tracking-[0.2em] text-slate-500 font-mono">Conqueror Level</span>
              </div>
              <span className="text-[12px] font-black text-haki-red font-mono">MAX</span>
            </div>
            <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden relative z-10">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: 2 }}
                className="bg-haki-red h-full shadow-[0_0_10px_#E61E2A]"
              />
            </div>
          </div>
        </div>
      </aside>

      {/* Main Bridge Environment */}
      <main className="flex-1 flex flex-col relative overflow-hidden z-10">

        {/* Header - Tactical HUD */}
        <header className="h-16 border-b border-white/5 flex items-center justify-between px-6 shrink-0 bg-haki-obsidian/80 backdrop-blur-3xl relative z-40">
          <div className="flex items-center gap-6">
            <Menu size={20} className="md:hidden text-haki-red" />
            <div className="relative group hidden lg:block">
              <Search size={14} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 transition-all group-focus-within:text-haki-red" />
              <input
                placeholder="Scan The Sea..."
                className="bg-haki-slate border border-white/5 rounded-xl pl-12 pr-6 py-2 text-[9px] w-[300px] focus:outline-none focus:border-haki-red/40 transition-all font-black text-white placeholder:text-slate-700 font-mono tracking-widest"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowAI(!showAI)}
              className={`flex items-center gap-3 px-5 py-2.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] transition-all font-mono shadow-2xl
                ${showAI ? 'bg-haki-red text-white shadow-[0_0_50px_rgba(230,30,42,0.3)]' : 'bg-white/5 text-white/40 border border-white/10'} `}
            >
              <Sparkles size={16} fill="currentColor" />
              Observation Haki
            </button>
            <button
              onClick={() => logout()}
              className="w-10 h-10 rounded-full bg-slate-900 border border-haki-red/30 flex items-center justify-center cursor-pointer hover:bg-haki-red/20 transition-all group active:scale-90"
            >
              <LogOut size={18} className="text-slate-500 group-hover:text-haki-red transition-colors" />
            </button>
          </div>
        </header>

        <div className="flex-1 flex overflow-hidden relative z-30">
          {/* Email List - Bounty Board */}
          <div className={`flex flex-col border-r border-white/5 bg-haki-obsidian/40 transition-all duration-700 ease-in-out ${selectedEmail ? 'md:w-[400px]' : 'w-full'} `}>
            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
              <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 flex items-center gap-3 font-mono neon-red">
                <Skull size={14} />
                {activeTab} LOG
              </h2>
              <div className="flex gap-3">
                {[
                  { id: 'Navigator (Inbox)', icon: <Compass size={12} /> },
                  { id: 'Jolly Roger', icon: <img src="/strawhat-logo.png" className="w-3 h-3 object-contain" /> },
                  { id: 'Blackbeard', icon: <img src="/blackbeard-logo.png" className="w-3 h-3 object-contain" /> },
                ].map(filter => (
                  <button
                    key={filter.id}
                    onClick={() => setActiveTab(filter.id as any)}
                    className={`px-4 py-1.5 rounded-full text-[8px] font-black uppercase border transition-all font-mono flex items-center gap-2
                      ${activeTab === filter.id ? 'bg-haki-red/20 border-haki-red text-haki-red shadow-[0_0_15px_rgba(230,30,42,0.3)]' : 'bg-white/5 text-slate-500 border-white/10 hover:border-haki-red/40 hover:text-haki-red'}`}
                  >
                    {filter.icon}
                    {filter.id}
                  </button>
                ))}

                <div className="w-[1px] h-6 bg-white/5 mx-2" />

                <button
                  onClick={handleBulkArchive}
                  disabled={!emails.some(e => e.isNoise)}
                  className={`px-4 py-1.5 rounded-full text-[8px] font-black uppercase border transition-all font-mono flex items-center gap-2
                    ${emails.some(e => e.isNoise)
                      ? 'text-haki-red border-haki-red/50 bg-haki-red/10 shadow-[0_0_20px_rgba(230,30,42,0.2)]'
                      : 'bg-white/5 text-slate-700 border-white/5 opacity-50 cursor-not-allowed'}`}
                  title="Archive identified noise (Auto-Triage)"
                >
                  <Skull size={12} />
                  Bulk Purge
                </button>

                <button
                  onClick={handleRefresh}
                  className={`p-2 rounded-full transition-all border border-white/5 bg-white/5 hover:bg-haki-red/10 hover:border-haki-red/40
                    ${isRefreshing ? 'animate-spin text-haki-red' : 'text-slate-500 hover:text-white'}`}
                >
                  <RefreshCw size={14} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
              {loading && emails.length === 0 ? (
                <div className="p-40 text-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                    className="w-24 h-24 border-t-4 border-r-4 border-haki-red rounded-full mx-auto mb-10 shadow-[0_0_50px_rgba(230,30,42,0.3)]"
                  />
                  <p className="text-[12px] font-black uppercase tracking-[0.4em] text-haki-red animate-pulse font-mono italic">Sailing the New World...</p>
                </div>
              ) : activeTab === 'Shipwright (Allies)' ? (
                <div className="space-y-6 p-4">
                  <h3 className="text-xl font-black uppercase tracking-widest text-haki-red mb-8 font-mono">Top Allies Detected</h3>
                  {allies.map((ally, i) => (
                    <div key={i} className="haki-card p-8 flex items-center justify-between group hover:border-haki-red/40 transition-all cursor-pointer">
                      <div className="flex items-center gap-6">
                        <div className="w-12 h-12 rounded-xl bg-haki-slate border border-white/5 flex items-center justify-center text-xl font-black text-slate-500 group-hover:text-haki-red transition-colors">
                          {ally.name[0]}
                        </div>
                        <div>
                          <p className="font-black text-white group-hover:text-haki-red transition-colors">{ally.name}</p>
                          <p className="text-[10px] text-slate-500 uppercase font-mono">{ally.count} Transmissions</p>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setComposeData({ ...composeData, to: ally.name });
                          setShowCompose(true);
                        }}
                        className="w-10 h-10 rounded-full border border-white/5 flex items-center justify-center text-slate-600 hover:text-haki-red hover:border-haki-red/40 transition-all"
                      >
                        <Send size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : activeTab === 'Log Pose' ? (
                <div className="space-y-8 p-6">
                  <h3 className="text-xl font-black uppercase tracking-widest text-haki-red font-mono">Command Intelligence Dashboard</h3>

                  {/* Category Breakdown */}
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { label: 'Action Required', count: emails.filter(e => e.category === 'Action Required').length, color: 'haki-red', glow: 'rgba(230,30,42,0.2)' },
                      { label: 'Awaiting Response', count: emails.filter(e => e.category === 'Awaiting Response').length, color: 'slate-400', glow: 'rgba(100,116,139,0.1)' },
                      { label: 'Low Priority', count: emails.filter(e => e.category === 'Low Priority').length, color: 'slate-600', glow: 'rgba(71,85,105,0.1)' },
                    ].map(stat => (
                      <div key={stat.label} className="haki-card p-6 text-center border-white/5" style={{ boxShadow: `0 0 30px ${stat.glow}` }}>
                        <p className={`text-3xl font-black text-${stat.color} font-mono`}>{stat.count}</p>
                        <p className="text-[8px] font-black uppercase tracking-[0.3em] text-slate-600 font-mono mt-2">{stat.label}</p>
                      </div>
                    ))}
                  </div>

                  {/* Follow-Up Tracker */}
                  <div className="haki-card p-6 border-white/5">
                    <h4 className="text-[9px] font-black uppercase tracking-[0.3em] text-amber-400 mb-4 font-mono flex items-center gap-2">
                      <Activity size={12} /> FOLLOW-UP TRACKER ({followUps.filter(f => !f.dismissed).length} active)
                    </h4>
                    {followUps.filter(f => !f.dismissed).length === 0 ? (
                      <p className="text-[11px] text-slate-600 font-mono">No active follow-ups. Reply to an email to auto-track.</p>
                    ) : (
                      <div className="space-y-2">
                        {followUps.filter(f => !f.dismissed).map(fu => {
                          const isDue = new Date(fu.remindAt) <= new Date();
                          return (
                            <div key={fu.threadId} className={`flex items-center justify-between p-3 rounded-lg border ${isDue ? 'bg-amber-500/5 border-amber-500/30' : 'bg-white/5 border-white/5'
                              }`}>
                              <div>
                                <p className="text-[11px] font-black text-white/80 font-mono truncate max-w-[300px]">{fu.subject}</p>
                                <p className="text-[8px] text-slate-600 font-mono">To: {fu.to} · Sent: {new Date(fu.sentAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                {isDue && <span className="text-[7px] font-black px-2 py-0.5 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-full font-mono uppercase animate-pulse">OVERDUE</span>}
                                <button
                                  onClick={() => {
                                    const updated = followUps.map(f => f.threadId === fu.threadId ? { ...f, dismissed: true } : f);
                                    setFollowUps(updated);
                                    localStorage.setItem('hakimail_followups', JSON.stringify(updated));
                                  }}
                                  className="text-[8px] text-slate-600 hover:text-haki-red font-mono uppercase"
                                >Dismiss</button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Smart Label Distribution */}
                  <div className="haki-card p-6 border-white/5">
                    <h4 className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 mb-4 font-mono">SIGNAL CLASSIFICATION</h4>
                    <div className="grid grid-cols-2 gap-3">
                      {(['Finance', 'Partnerships', 'Operations', 'Support', 'Newsletter', 'Marketing', 'Personal', 'Business'] as SmartLabel[]).map(label => {
                        const count = emails.filter(e => e.smartLabel === label).length;
                        if (count === 0) return null;
                        const colors = smartLabelColors[label];
                        return (
                          <div key={label} className={`flex items-center justify-between px-3 py-2 rounded-lg border ${colors.bg} ${colors.border}`}>
                            <span className={`text-[9px] font-black uppercase tracking-wider font-mono ${colors.text}`}>{label}</span>
                            <span className={`text-[11px] font-black font-mono ${colors.text}`}>{count}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Top Contacts */}
                  <div className="haki-card p-6 border-white/5">
                    <h4 className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 mb-4 font-mono">TOP CONTACTS</h4>
                    <div className="space-y-2">
                      {Object.values(contactProfiles)
                        .sort((a, b) => b.relationshipScore - a.relationshipScore)
                        .slice(0, 8)
                        .map(profile => {
                          const strength = contactIntelligence.getStrengthLabel(profile.relationshipScore);
                          return (
                            <div key={profile.email} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5 hover:border-white/10 transition-all">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[9px] font-black"
                                  style={{ backgroundColor: strength.color + '20', color: strength.color }}>
                                  {profile.relationshipScore}
                                </div>
                                <div>
                                  <p className="text-[10px] font-black text-white/80 font-mono">{profile.name}</p>
                                  <p className="text-[8px] text-slate-600 font-mono">{profile.email}</p>
                                </div>
                              </div>
                              <span className="text-[7px] font-black uppercase tracking-wider font-mono" style={{ color: strength.color }}>{strength.label}</span>
                            </div>
                          );
                        })}
                    </div>
                  </div>

                  {/* Volume Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="haki-card p-6 text-center border-white/5">
                      <p className="text-3xl font-black text-white font-mono">{emails.length}</p>
                      <p className="text-[8px] font-black uppercase tracking-[0.3em] text-slate-600 font-mono mt-2">Total Signals</p>
                    </div>
                    <div className="haki-card p-6 text-center border-white/5">
                      <p className="text-3xl font-black text-white font-mono">{emails.filter(e => !e.read).length}</p>
                      <p className="text-[8px] font-black uppercase tracking-[0.3em] text-slate-600 font-mono mt-2">Unread</p>
                    </div>
                  </div>
                </div>
              ) : activeTab === 'Commander' ? (
                <div className="h-full flex flex-col p-6 max-w-4xl mx-auto w-full">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 rounded-2xl bg-haki-red/10 border border-haki-red/20 flex items-center justify-center text-haki-red shadow-[0_0_20px_rgba(230,30,42,0.1)]">
                      <Terminal size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-black uppercase tracking-widest text-haki-red font-mono">Commander's Quarters</h3>
                      <p className="text-[10px] text-slate-500 font-mono uppercase tracking-[0.2em]">Strategic Signal Intelligence Terminal</p>
                    </div>
                  </div>

                  {/* Chat Messages */}
                  <div className="flex-1 overflow-y-auto mb-6 pr-4 custom-scrollbar space-y-6">
                    {chatMessages.map((msg) => (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, x: msg.sender === 'User' ? 20 : -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`flex ${msg.sender === 'User' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[80%] rounded-2xl p-5 border ${msg.sender === 'User'
                          ? 'bg-haki-red/10 border-haki-red/20 text-white'
                          : 'bg-white/5 border-white/10 text-slate-300'
                          }`}>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-[8px] font-black uppercase tracking-widest opacity-50 font-mono">
                              {msg.sender === 'User' ? 'Captain' : 'Antigravity'}
                            </span>
                          </div>
                          <p className="text-[13px] leading-relaxed font-mono whitespace-pre-wrap">{msg.text}</p>
                          {msg.action && (
                            <div className="mt-4 pt-4 border-t border-white/5">
                              <span className="text-[9px] font-black uppercase text-haki-red font-mono">TACTICAL COMMAND EXECUTED: {msg.action.type.toUpperCase()}</span>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                    {isAIProcessing && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                        <div className="bg-white/5 border border-white/10 rounded-2xl px-5 py-3 flex gap-2">
                          <span className="w-1.5 h-1.5 bg-haki-red rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="w-1.5 h-1.5 bg-haki-red rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="w-1.5 h-1.5 bg-haki-red rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      </motion.div>
                    )}
                  </div>

                  {/* Input Area */}
                  <form onSubmit={handleChatSubmit} className="relative">
                    <input
                      autoFocus
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder="Issue strategic orders (e.g., 'Draft an email...', 'Clean my inbox'...)"
                      className="w-full bg-haki-slate border border-white/10 rounded-2xl p-6 text-[13px] font-bold text-white focus:outline-none focus:border-haki-red/40 transition-all font-mono pr-16 shadow-[0_0_50px_rgba(0,0,0,0.5)]"
                    />
                    <button
                      type="submit"
                      disabled={!chatInput.trim() || isAIProcessing}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-haki-red text-white flex items-center justify-center hover:bg-haki-red/80 transition-all disabled:opacity-30 ripple"
                    >
                      <Zap size={20} fill="currentColor" />
                    </button>
                  </form>
                </div>
              ) : (
                <div className="space-y-2 pb-20">
                  {processedEmails.map((email) => {
                    const labelStyle = email.smartLabel ? smartLabelColors[email.smartLabel] : null;
                    const followUp = followUps.find(f => f.threadId === email.threadId && !f.dismissed);
                    const isFollowUpDue = followUp && new Date(followUp.remindAt) <= new Date();

                    return (
                      <div
                        key={email.id}
                        onClick={() => setSelectedEmail(email)}
                        className={`haki-signal-row group ${selectedEmail?.id === email.id ? 'bg-haki-red/5 haki-surge-active' : ''}`}
                      >
                        <HakiBolt active={selectedEmail?.id === email.id} />
                        {selectedEmail?.id === email.id && (
                          <motion.div layoutId="activeSignal" className="absolute left-0 top-0 bottom-0 w-1 bg-haki-red shadow-[0_0_15px_#E61E2A] z-20" />
                        )}

                        <div className="flex justify-between items-start mb-2 relative z-10">
                          <div className="flex items-center gap-2">
                            <h3 className="text-[9px] font-black tracking-[0.2em] uppercase text-slate-500 group-hover:text-haki-red transition-all font-mono">{email.from}</h3>
                            {isFollowUpDue && (
                              <span className="text-[7px] font-black px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 uppercase tracking-wider font-mono animate-pulse">
                                FOLLOW UP
                              </span>
                            )}
                          </div>
                          <span className="text-[8px] font-black text-slate-700 font-mono">{email.date}</span>
                        </div>

                        <p className="text-[13px] font-black uppercase leading-tight text-white/80 mb-1.5 font-mono tracking-tight group-hover:text-white transition-colors">{email.subject}</p>
                        <p className="text-[10px] text-slate-600 line-clamp-1 font-bold leading-relaxed mb-3 font-sans">{email.snippet}</p>

                        <div className="flex gap-2 relative z-10 flex-wrap">
                          <span className={`text-[7px] font-black px-3 py-1 rounded-lg uppercase tracking-[0.2em] font-mono border
                                  ${email.category === 'Action Required' ? 'border-haki-red text-haki-red bg-haki-red/5 shadow-[0_0_20px_rgba(230,30,42,0.1)]' :
                              email.category === 'Awaiting Response' ? 'border-slate-800 text-slate-400' :
                                'border-transparent text-slate-700'
                            } `}>
                            {email.category}
                          </span>
                          {labelStyle && email.smartLabel && (
                            <span className={`text-[7px] font-black px-2.5 py-1 rounded-lg uppercase tracking-[0.15em] font-mono border ${labelStyle.bg} ${labelStyle.text} ${labelStyle.border}`}>
                              {email.smartLabel}
                            </span>
                          )}
                          {!email.read && <div className="w-1.5 h-1.5 rounded-full bg-haki-red shadow-[0_0_10px_#E61E2A] mt-1" />}
                        </div>
                      </div>
                    );
                  })}

                  {nextPageToken && (
                    <motion.button
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      onClick={handleLoadMore}
                      disabled={loading}
                      className="w-full py-6 mt-8 haki-card border-dashed border-white/10 hover:border-haki-red/40 hover:bg-haki-red/5 transition-all group flex flex-col items-center gap-3 bg-black/20"
                    >
                      <ArrowDownCircle size={20} className={`text-slate-600 group-hover:text-haki-red transition-all ${loading ? 'animate-bounce' : ''}`} />
                      <span className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500 group-hover:text-white font-mono">
                        {loading ? 'Decrypting More Signals...' : 'Fetch More Signals'}
                      </span>
                    </motion.button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tactical View */}
        <AnimatePresence mode="wait">
          {selectedEmail && (
            <motion.div
              key={selectedEmail.id}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
              className="w-full lg:w-[700px] flex flex-col h-full relative bg-card/5 backdrop-blur-sm border-l border-white/5"
            >
              {/* Tactical Actions - Top Right */}
              <div className="absolute top-8 right-8 z-50 flex gap-4">
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setComposeData({
                        to: selectedEmail.fromEmail,
                        cc: "",
                        subject: selectedEmail.subject.startsWith('Re:') ? selectedEmail.subject : `Re: ${selectedEmail.subject}`,
                        body: "",
                        originalBody: selectedEmail.body,
                        threadId: selectedEmail.threadId
                      } as any);
                      setShowCompose(true);
                    }}
                    className="w-12 h-12 rounded-xl bg-slate-900/80 border border-white/10 flex items-center justify-center hover:bg-haki-red/20 hover:border-haki-red/40 transition-all group"
                    title="Counter-Strike (Reply)"
                  >
                    <Reply size={20} className="text-slate-500 group-hover:text-haki-red transition-colors" />
                  </button>
                  <button
                    onClick={() => {
                      // Extract all recipients except the Captain himself (mocking 'me')
                      const allTo = selectedEmail.to.split(',').map(s => s.trim()).filter(s => s !== 'me' && s !== 'marvin');
                      const allCc = selectedEmail.cc.split(',').map(s => s.trim()).filter(s => s !== 'me' && s !== 'marvin');

                      setComposeData({
                        to: [selectedEmail.fromEmail, ...allTo].join(', '),
                        cc: allCc.join(', '),
                        subject: selectedEmail.subject.startsWith('Re:') ? selectedEmail.subject : `Re: ${selectedEmail.subject}`,
                        body: "",
                        originalBody: selectedEmail.body,
                        threadId: selectedEmail.threadId
                      } as any);
                      setShowCompose(true);
                    }}
                    className="w-12 h-12 rounded-xl bg-slate-900/80 border border-white/10 flex items-center justify-center hover:bg-haki-red/20 hover:border-haki-red/40 transition-all group"
                    title="Full Salvo (Reply All)"
                  >
                    <Users size={20} className="text-slate-500 group-hover:text-haki-red transition-colors" />
                  </button>
                </div>

                <button
                  onClick={() => {
                    // Mark as handled — downgrade from Action Required
                    setRepliedThreads(prev => {
                      const next = new Set(prev);
                      next.add(selectedEmail.threadId);
                      return next;
                    });
                    setEmails(prev => prev.map(e =>
                      e.id === selectedEmail.id ? { ...e, category: 'Awaiting Response' as const } : e
                    ));
                    setSelectedEmail({ ...selectedEmail, category: 'Awaiting Response' });
                  }}
                  className={`w-12 h-12 rounded-xl bg-slate-900/80 border border-white/10 flex items-center justify-center hover:bg-emerald-500/20 hover:border-emerald-500/40 transition-all group ${selectedEmail.category !== 'Action Required' ? 'opacity-30 pointer-events-none' : ''
                    }`}
                  title="Mark as Handled"
                >
                  <CheckCircle2 size={20} className="text-slate-500 group-hover:text-emerald-400 transition-colors" />
                </button>
                <button
                  onClick={() => handleTrash(selectedEmail.id)}
                  className="w-12 h-12 rounded-xl bg-slate-900/80 border border-white/10 flex items-center justify-center hover:bg-haki-red/20 hover:border-haki-red/40 transition-all group"
                  title="Purge Signal (Delete)"
                >
                  <Trash2 size={20} className="text-slate-500 group-hover:text-haki-red transition-colors" />
                </button>
                <button
                  onClick={() => setSelectedEmail(null)}
                  className="w-12 h-12 rounded-xl bg-slate-900/80 border border-white/10 flex items-center justify-center hover:bg-haki-red/20 hover:border-haki-red/40 transition-all group"
                  title="Withdraw Signal"
                >
                  <X size={20} className="text-slate-500 group-hover:text-haki-red transition-colors" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-12 lg:p-16 custom-scrollbar">
                <div className="max-w-4xl mx-auto">
                  <div className="flex items-center gap-6 mb-8">
                    <div className="w-14 h-14 rounded-2xl bg-haki-slate border border-haki-red/30 flex items-center justify-center overflow-hidden shadow-2xl shrink-0 group">
                      {getDomain(selectedEmail.from) ? (
                        <img
                          src={`https://www.google.com/s2/favicons?domain=${getDomain(selectedEmail.from)}&sz=128`}
                          alt="Fleet Logo"
                          className="w-full h-full object-contain p-2 scale-110 group-hover:scale-125 transition-transform"
                          onError={(e) => {
                            (e.currentTarget.style.display = 'none');
                            // Fallback to initial
                          }}
                        />
                      ) : (
                        <span className="text-haki-red font-black text-2xl font-mono">{selectedEmail.from[0]}</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <motion.h2
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="text-xl font-black tracking-tighter uppercase italic leading-tight mb-2 font-mono text-white"
                      >
                        {selectedEmail.subject}
                      </motion.h2>
                      <div className="flex items-center gap-4">
                        <p className="text-[10px] text-haki-red font-black uppercase tracking-[0.3em] font-mono">{selectedEmail.from}</p>
                        <span className="text-[10px] text-slate-600 font-black font-mono">{selectedEmail.date}</span>

                        <div className="flex gap-2">
                          {/* ALLY BUTTON (Jolly Roger) */}
                          <button
                            onClick={() => {
                              const fromEmail = selectedEmail.from.match(/<(.+)>/)?.[1] || selectedEmail.from;
                              toggleManualAlly(fromEmail);
                            }}
                            className={`flex items-center gap-2 px-3 py-1 rounded-lg border transition-all ${manualAllies.has(selectedEmail.from.match(/<(.+)>/)?.[1] || selectedEmail.from)
                              ? 'bg-haki-red/20 border-haki-red text-haki-red shadow-[0_0_15px_rgba(230,30,42,0.3)]'
                              : 'bg-white/5 border-white/10 text-slate-500 hover:text-white hover:border-white/30'
                              }`}
                          >
                            <img src="/strawhat-logo.png" alt="Ally" className="w-3.5 h-3.5 object-contain" />
                            <span className="text-[8px] font-black uppercase tracking-widest font-mono">ALLY</span>
                          </button>

                          {/* ROGUE BUTTON (Blackbeard) */}
                          <button
                            onClick={() => {
                              const fromEmail = selectedEmail.from.match(/<(.+)>/)?.[1] || selectedEmail.from;
                              toggleManualUnimportant(fromEmail);
                            }}
                            className={`flex items-center gap-2 px-3 py-1 rounded-lg border transition-all ${manualUnimportant.has(selectedEmail.from.match(/<(.+)>/)?.[1] || selectedEmail.from)
                              ? 'bg-slate-800 border-slate-500 text-white shadow-[0_0_15px_rgba(255,255,255,0.1)]'
                              : 'bg-white/5 border-white/10 text-slate-500 hover:text-white hover:border-white/30'
                              }`}
                          >
                            <img src="/blackbeard-logo.png" alt="Rogue" className="w-3.5 h-3.5 object-contain opacity-50 contrast-125" />
                            <span className="text-[8px] font-black uppercase tracking-widest font-mono">ROGUE</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Contact Intelligence Card */}
                  {(() => {
                    const profile = contactProfiles[selectedEmail.fromEmail?.toLowerCase()];
                    if (!profile) return null;
                    const strength = contactIntelligence.getStrengthLabel(profile.relationshipScore);
                    return (
                      <div className="mb-6 p-4 haki-card border-white/5 bg-black/30 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-[11px] font-black"
                            style={{ backgroundColor: strength.color + '20', color: strength.color, border: `1px solid ${strength.color}40` }}>
                            {profile.relationshipScore}
                          </div>
                          <div>
                            <p className="text-[9px] font-black uppercase tracking-[0.2em] font-mono" style={{ color: strength.color }}>
                              {strength.label}
                            </p>
                            <p className="text-[8px] text-slate-600 font-mono mt-0.5">
                              {profile.domain} · {profile.totalReceived} received · {profile.totalSent} sent
                            </p>
                          </div>
                        </div>
                        {profile.lastContactDate && (
                          <p className="text-[8px] text-slate-600 font-mono">
                            Last: {profile.lastContactDate.toLocaleDateString([], { month: 'short', day: 'numeric' })}
                          </p>
                        )}
                      </div>
                    );
                  })()}

                  {/* Thread Conversation View */}
                  <div className="space-y-6">
                    {threadMessages.length > 1 ? (
                      [...threadMessages]
                        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                        .map((msg) => (
                          <div
                            key={msg.id}
                            className={`relative group p-8 haki-card shadow-xl overflow-hidden border-white/10 ${msg.isSent ? 'bg-haki-red/5 border-l-2 border-l-haki-red' : 'bg-black/40'
                              }`}
                          >
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center gap-3">
                                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black ${msg.isSent ? 'bg-haki-red/20 text-haki-red' : 'bg-white/10 text-slate-400'
                                  }`}>
                                  {msg.from?.[0] || '?'}
                                </div>
                                <span className={`text-[10px] font-black uppercase tracking-[0.2em] font-mono ${msg.isSent ? 'text-haki-red' : 'text-slate-500'
                                  }`}>
                                  {msg.isSent ? 'YOU' : msg.from}
                                </span>
                              </div>
                              <span className="text-[8px] text-slate-600 font-mono">
                                {msg.date?.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <p className="text-[15px] lg:text-[16px] leading-[1.8] text-white/90 font-medium whitespace-pre-wrap selection:bg-haki-red/40 font-sans tracking-tight">
                              {msg.body}
                            </p>
                          </div>
                        ))
                    ) : (
                      <div className="relative group p-10 haki-card shadow-2xl overflow-hidden min-h-[400px] border-white/10 bg-black/40">
                        <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-full bg-haki-red opacity-0 group-hover:opacity-100 transition-opacity`} />
                        <div className="relative z-10">
                          <p className="text-[16px] lg:text-[17px] leading-[1.8] text-white/95 font-medium whitespace-pre-wrap selection:bg-haki-red/40 font-sans tracking-tight">
                            {selectedEmail.body || selectedEmail.snippet}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Attachment Vault (Booty) */}
                  {selectedEmail.attachments && selectedEmail.attachments.length > 0 && (
                    <div className="mt-8">
                      <h4 className="text-[9px] font-black uppercase tracking-[0.4em] text-haki-red mb-4 flex items-center gap-3 font-mono">
                        <Paperclip size={12} />
                        INCOMING BOOTY ({selectedEmail.attachments.length})
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {selectedEmail.attachments.map((file: any, idx: number) => (
                          <div key={idx} className="haki-card p-4 flex items-center gap-4 group hover:border-haki-red/40 cursor-pointer transition-all">
                            <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-500 group-hover:text-haki-red transition-colors">
                              <Activity size={14} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-black text-[11px] text-white truncate uppercase tracking-wider">{file.name}</p>
                              <p className="text-[8px] text-slate-500 font-mono">{file.size} Bytes</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Haki Insight HUD */}
              <AnimatePresence>
                {showAI && (
                  <motion.div
                    initial={{ opacity: 0, x: 500 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 500 }}
                    className="absolute right-0 top-0 bottom-0 w-[350px] border-l border-haki-red/30 p-8 flex flex-col shadow-[-30px_0_100px_rgba(0,0,0,0.9)] z-50 bg-[#0C0C0E]/95"
                  >
                    <div className="absolute top-0 right-0 p-6">
                      <button onClick={() => setShowAI(false)} className="w-12 h-12 rounded-full flex items-center justify-center bg-white/5 hover:bg-haki-red/20 transition-all text-slate-600 shadow-xl group">
                        <ChevronRight size={24} className="group-hover:translate-x-1 transition-transform group-hover:text-haki-red" />
                      </button>
                    </div>

                    <div className="flex items-center gap-4 mb-10">
                      <div className="w-12 h-12 rounded-xl bg-slate-900 border-2 border-haki-red p-1.5 shadow-[0_0_20px_rgba(230,30,42,0.3)]">
                        <img src="/cyber-luffy.png" alt="Oracle" className="w-full h-full object-contain" />
                      </div>
                      <div>
                        <h3 className="text-lg font-black uppercase tracking-[0.3em] italic font-mono neon-red leading-none">HAKI</h3>
                        <span className="text-[9px] font-black text-haki-red/50 uppercase tracking-[0.4em] font-mono mt-1 block italic">Sense Active</span>
                      </div>
                    </div>

                    <div className="space-y-8 flex-1 overflow-y-auto pr-4 custom-scrollbar">
                      {/* Haki Summary */}
                      <section>
                        <h4 className="text-[10px] font-black uppercase text-slate-600 mb-4 tracking-[0.4em] flex items-center gap-3 font-mono">
                          <div className="w-3 h-3 bg-haki-red rounded-full shadow-[0_0_20px_#E61E2A] animate-pulse" />
                          ORACLE SENSE
                        </h4>
                        <motion.div
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="p-6 bg-haki-red/5 border-l-[6px] border-haki-red rounded-2xl text-[13px] leading-relaxed text-haki-red font-black italic shadow-inner wanted-card"
                        >
                          {aiSuggestion?.summary || "// Sensing the sea..."}
                        </motion.div>
                      </section>

                      {/* Haki Intel (Research) */}
                      {hakiIntel && (
                        <section>
                          <h4 className="text-[10px] font-black uppercase text-slate-600 mb-4 tracking-[0.4em] flex items-center gap-3 font-mono">
                            <Anchor size={12} className="text-haki-red" />
                            HAKI INTEL
                          </h4>
                          <div className="p-6 bg-haki-slate/50 border border-white/5 rounded-2xl text-[11px] leading-relaxed text-slate-400 font-mono italic">
                            {hakiIntel}
                          </div>
                        </section>
                      )}

                      {/* Crew Tactics */}
                      <section className="mb-10">
                        <h4 className="text-[10px] font-black uppercase text-slate-600 mb-6 tracking-[0.4em] flex items-center gap-3 font-mono">
                          <div className="w-3 h-3 bg-haki-red rounded-full shadow-[0_0_20px_#E61E2A]" />
                          TACTICS
                        </h4>
                        <div className="space-y-4">
                          {(aiSuggestion?.tactics || [
                            { type: 'Navigator', text: "Logged coordinates. Ready for deployment." },
                            { type: 'Swordsman', text: "Signal verified. Sharp response prepped." },
                            { type: 'Monkey', text: "I'm ready! Let's go!" }
                          ]).map((resp, i) => (
                            <div
                              key={i}
                              onClick={() => setSelectedTacticIndex(i)}
                              className={`p-6 wanted-card transition-all cursor-pointer group shadow-2xl active:scale-95 border-2
                                  ${selectedTacticIndex === i ? 'border-haki-red bg-haki-red/5' : 'border-transparent hover:border-haki-red/40'}`}
                            >
                              <div className="flex justify-between items-center mb-4">
                                <span className={`text-[10px] font-black group-hover:text-haki-red transition-colors uppercase tracking-[0.3em] font-mono
                                    ${selectedTacticIndex === i ? 'text-haki-red' : 'text-slate-500'}`}>
                                  {resp.type}
                                </span>
                                <div className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all shadow-lg
                                    ${selectedTacticIndex === i ? 'border-haki-red text-haki-red bg-haki-red/10' : 'border-white/10 text-slate-600 group-hover:border-haki-red group-hover:text-haki-red'}`}>
                                  <CheckCircle2 size={16} />
                                </div>
                              </div>
                              <p className={`text-[11px] leading-relaxed transition-colors italic font-mono
                                  ${selectedTacticIndex === i ? 'text-white font-bold' : 'text-white/50 group-hover:text-white'}`}>
                                {resp.text}
                              </p>
                            </div>
                          ))}
                        </div>
                      </section>

                      {/* TACTICAL PREVIEW PANE */}
                      <section className="mb-8 pr-4">
                        <h4 className="text-[10px] font-black uppercase text-slate-600 mb-4 tracking-[0.4em] flex items-center gap-3 font-mono">
                          <Search size={12} className="text-haki-red" />
                          TACTICAL PREVIEW
                        </h4>
                        <div className="p-6 bg-haki-slate/20 border border-haki-red/20 rounded-2xl relative overflow-hidden group min-h-[180px] flex flex-col">
                          <div className="absolute top-0 right-0 p-3 opacity-20">
                            <Skull size={14} />
                          </div>
                          <div className="flex-1">
                            <p className="text-[12px] leading-relaxed text-slate-200 font-sans whitespace-pre-wrap italic relative z-10 selection:bg-haki-red/40 mb-6">
                              {(aiSuggestion?.tactics || [
                                { type: 'Navigator', text: "Logged coordinates. Ready for deployment." },
                                { type: 'Swordsman', text: "Signal verified. Sharp response prepped." },
                                { type: 'Monkey', text: "I'm ready! Let's go!" }
                              ])[selectedTacticIndex]?.text}
                            </p>
                          </div>
                          <button
                            onClick={() => {
                              if (selectedEmail) {
                                const text = (aiSuggestion?.tactics || [])[selectedTacticIndex]?.text;
                                setComposeData({
                                  to: selectedEmail.fromEmail,
                                  subject: selectedEmail.subject.startsWith('Re:') ? selectedEmail.subject : `Re: ${selectedEmail.subject}`,
                                  body: text || "",
                                  originalBody: selectedEmail.body,
                                  threadId: selectedEmail.threadId
                                } as any);
                                setShowCompose(true);
                              }
                            }}
                            className="self-end px-6 py-2 bg-haki-red/10 border border-haki-red/30 rounded-lg text-[10px] font-black uppercase tracking-widest text-haki-red hover:bg-haki-red hover:text-white transition-all shadow-xl flex items-center gap-2 group"
                          >
                            <Reply size={14} className="group-hover:-rotate-12 transition-transform" />
                            LOAD INTO BRIDGE
                          </button>
                        </div>
                      </section>
                    </div>

                    <div className="mt-auto pt-8">
                      <div className="mb-6 px-4 py-3 bg-white/5 rounded-xl border border-white/10">
                        <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-1 font-mono">Tone Match</p>
                        <p className="text-[10px] font-black text-haki-red uppercase tracking-widest font-mono">{aiSuggestion?.toneMatch || "Analyzing..."}</p>
                      </div>
                      <button
                        onClick={() => {
                          if (selectedEmail) {
                            const tactics = aiSuggestion?.tactics || [
                              { type: 'Navigator', text: "Logged coordinates. Ready for deployment." },
                              { type: 'Swordsman', text: "Signal verified. Sharp response prepped." },
                              { type: 'Monkey', text: "Let's go! I'm hungry for action!" }
                            ];
                            const replyBody = tactics[selectedTacticIndex]?.text || tactics[1].text;
                            if (confirm(`ARMING BURST: Are you sure you want to fire the ${tactics[selectedTacticIndex]?.type}'s payload?`)) {
                              handleSend(
                                selectedEmail.fromEmail,
                                selectedEmail.subject.startsWith('Re:') ? selectedEmail.subject : `Re: ${selectedEmail.subject}`,
                                replyBody,
                                selectedEmail.threadId
                              );
                            }
                          }
                        }}
                        disabled={sending}
                        className="haki-btn-primary w-full py-5 flex items-center justify-center gap-4 disabled:opacity-50 text-[12px] group"
                      >
                        {sending ? (
                          <Activity size={22} className="animate-spin" />
                        ) : (
                          <Zap size={22} fill="currentColor" className="group-hover:rotate-12 transition-transform" />
                        )}
                        {sending ? "TRANSMITTING..." : `FIRE ${(aiSuggestion?.tactics?.[selectedTacticIndex]?.type || 'CREW').toUpperCase()} BURST`}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Compose Modal - Log Pose Interface */}
        <AnimatePresence>
          {showCompose && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-xl p-6"
            >
              <motion.div
                initial={{ scale: 0.98, y: 10 }}
                animate={{ scale: 1, y: 0 }}
                className="max-w-6xl w-full haki-card p-12 border-haki-red/10 flex flex-col md:flex-row gap-12 max-h-[90vh] overflow-hidden"
              >
                {/* Mission Log Reference */}
                {(composeData as any).originalBody && (
                  <div className="md:w-1/3 border-r border-white/5 pr-12 hidden md:flex flex-col">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600 mb-6 font-mono flex items-center gap-3">
                      <Compass size={12} className="text-haki-red" />
                      MISSION LOG
                    </h3>
                    <div className="flex-1 overflow-y-auto custom-scrollbar bg-haki-slate/30 rounded-2xl p-6 border border-white/5">
                      <p className="text-[11px] leading-relaxed text-slate-400 font-sans whitespace-pre-wrap italic">
                        {(composeData as any).originalBody}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex-1 flex flex-col">
                  <div className="flex justify-between items-center mb-10">
                    <h2 className="text-2xl font-black uppercase italic font-mono text-white">Create New Signal</h2>
                    <button onClick={() => setShowCompose(false)} className="text-slate-600 hover:text-white transition-colors">
                      <ChevronRight size={28} className="rotate-90" />
                    </button>
                  </div>

                  <div className="space-y-8">
                    <div className="flex gap-4">
                      <div className="flex-1 space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 font-mono">Target</label>
                        <input
                          value={composeData.to}
                          onChange={(e) => setComposeData({ ...composeData, to: e.target.value })}
                          placeholder="crew@haki-mail.com"
                          className="w-full bg-haki-slate border border-white/5 rounded-xl p-4 text-[11px] font-bold text-white focus:outline-none focus:border-haki-red/40 transition-all font-mono"
                        />
                      </div>
                      <div className="w-1/3 space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 font-mono">CC (Allies)</label>
                        <input
                          value={composeData.cc}
                          onChange={(e) => setComposeData({ ...composeData, cc: e.target.value })}
                          placeholder="Allies"
                          className="w-full bg-haki-slate border border-white/5 rounded-xl p-4 text-[11px] font-bold text-white focus:outline-none focus:border-haki-red/40 transition-all font-mono"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 font-mono">Mission</label>
                      <input
                        value={composeData.subject}
                        onChange={(e) => setComposeData({ ...composeData, subject: e.target.value })}
                        placeholder="Mission Objective"
                        className="w-full bg-haki-slate border border-white/5 rounded-xl p-4 text-[11px] font-bold text-white focus:outline-none focus:border-haki-red/40 transition-all font-mono"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 font-mono">Logs</label>
                      <textarea
                        value={composeData.body}
                        onChange={(e) => setComposeData({ ...composeData, body: e.target.value })}
                        placeholder="Enter logs..."
                        rows={6}
                        className="w-full bg-haki-slate border border-white/5 rounded-xl p-4 text-[11px] font-bold text-white focus:outline-none focus:border-haki-red/40 transition-all font-mono resize-none"
                      />
                    </div>
                  </div>

                  <div className="mt-10 flex gap-4">
                    <button
                      onClick={() => handleSend(composeData.to, composeData.subject, composeData.body, (composeData as any).threadId, composeData.cc)}
                      disabled={sending || !composeData.to}
                      className="haki-btn-primary flex-1 flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                      {sending ? <Activity size={18} className="animate-spin" /> : <Send size={18} />}
                      {sending ? "Bursting..." : "Execute mission"}
                    </button>
                    <button
                      onClick={() => setShowCompose(false)}
                      className="haki-btn-ghost flex-1"
                    >
                      Hold
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Intelligence Report Modal */}
        <AnimatePresence>
          {showReport && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 backdrop-blur-3xl p-6"
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="max-w-2xl w-full haki-card p-12 border-haki-red/20 bg-haki-slate/90 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-64 h-64 bg-haki-red/5 blur-[100px] -z-10" />

                <div className="flex justify-between items-center mb-10">
                  <div className="flex items-center gap-4">
                    <Sparkles className="text-haki-red" size={24} />
                    <h2 className="text-2xl font-black uppercase italic font-mono text-white tracking-tighter">Haki Intelligence Report</h2>
                  </div>
                  <button onClick={() => setShowReport(false)} className="text-slate-600 hover:text-white transition-colors">
                    <X size={24} />
                  </button>
                </div>

                <div className="bg-black/40 rounded-2xl p-8 border border-white/5 font-mono">
                  <pre className="text-[12px] leading-relaxed text-slate-300 whitespace-pre-wrap font-sans">
                    {hakiReport || "Compiling intelligence logs... The Grand Line is vast."}
                  </pre>
                </div>

                <div className="mt-10">
                  <button
                    onClick={() => setShowReport(false)}
                    className="haki-btn-primary w-full py-4 uppercase font-black tracking-[0.3em] font-mono italic"
                  >
                    Return to Bridge
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default App;
