import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import API from '../api/axios'
import toast from 'react-hot-toast'

const timeAgo = (str) => {
  if (!str) return ''
  const diff = (Date.now() - new Date(str)) / 1000
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff/60)}m ago`
  if (diff < 86400) return `${Math.floor(diff/3600)}h ago`
  return `${Math.floor(diff/86400)}d ago`
}

const avatarColors = ['#6366F1','#14B8A6','#F59E0B','#F43F5E','#818CF8','#10B981']
const colorFor = (str) => avatarColors[(str?.charCodeAt(0) || 0) % avatarColors.length]

export default function ContentPage() {
  const { isAdmin, isEditor } = useAuth()
  const canWrite = isAdmin || isEditor
  const [items, setItems]     = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm]       = useState({ title:'', body:'' })
  const [editId, setEditId]   = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const fetchContent = async () => {
    setLoading(true)
    try { const r = await API.get('/content'); setItems(r.data || []) }
    catch { toast.error('Failed to load content') }
    finally { setLoading(false) }
  }
  useEffect(() => { fetchContent() }, [])

  const handleSubmit = async (e) => {
    e.preventDefault(); setSubmitting(true)
    try {
      if (editId) { await API.put(`/content/${editId}`, form); toast.success('Content updated!') }
      else        { await API.post('/content', form);          toast.success('Content published!') }
      setForm({ title:'', body:'' }); setEditId(null); setShowForm(false); fetchContent()
    } catch (err) { toast.error(err.response?.data?.error || 'Action failed') }
    finally { setSubmitting(false) }
  }

  const startEdit = (item) => {
    setEditId(item.ID); setForm({ title: item.title, body: item.body }); setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const cancelForm = () => { setEditId(null); setForm({ title:'', body:'' }); setShowForm(false) }

  const handleDelete = async (id) => {
    if (!confirm('Permanently delete this content item?')) return
    try { await API.delete(`/content/${id}`); toast.success('Content deleted'); fetchContent() }
    catch (err) { toast.error(err.response?.data?.error || 'Delete failed') }
  }

  return (
    <div className="animate-fade-up">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="font-display text-4xl font-bold text-white">Content</h1>
          <p className="text-slate-500 text-sm mt-1">
            {loading ? 'Loading…' : `${items.length} item${items.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        {canWrite && !showForm && (
          <button onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white font-display transition-all hover:-translate-y-0.5 active:translate-y-0"
            style={{background:'linear-gradient(135deg, #6366F1, #4F46E5)', boxShadow:'0 4px 20px rgba(99,102,241,0.3)'}}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            New content
          </button>
        )}
      </div>

      {/* Form */}
      {showForm && canWrite && (
        <div className="glass rounded-2xl p-6 mb-6 animate-fade-up" style={{border:'1px solid rgba(99,102,241,0.25)', boxShadow:'0 0 30px rgba(99,102,241,0.08)'}}>
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display font-semibold text-white text-lg">
              {editId ? '✏️ Edit item' : '📝 New content item'}
            </h2>
            <button onClick={cancelForm} className="w-8 h-8 rounded-lg bg-surface-700 hover:bg-surface-600 flex items-center justify-center text-slate-400 hover:text-white transition-all text-lg leading-none">&times;</button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2 font-display">Title</label>
              <input className="input-field" value={form.title} onChange={e=>setForm({...form,title:e.target.value})}
                placeholder="Give your content a clear title…" required minLength={3} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2 font-display">Body</label>
              <textarea className="input-field resize-none" rows={5} value={form.body} onChange={e=>setForm({...form,body:e.target.value})}
                placeholder="Write your content here…" required minLength={5} />
            </div>
            <div className="flex items-center gap-3 pt-1">
              <button type="submit" disabled={submitting}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white font-display transition-all disabled:opacity-50"
                style={{background:'linear-gradient(135deg,#6366F1,#4F46E5)'}}>
                {submitting
                  ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>{editId?'Updating…':'Publishing…'}</>
                  : editId ? 'Update item' : 'Publish'}
              </button>
              <button type="button" onClick={cancelForm}
                className="px-6 py-2.5 rounded-xl text-sm text-slate-400 border border-surface-500 hover:border-slate-400 hover:text-slate-200 transition-all font-display">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Content list */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-28 gap-4">
          <div className="w-10 h-10 border-2 border-accent/20 border-t-accent rounded-full animate-spin"/>
          <p className="text-slate-600 text-sm font-display">Loading content…</p>
        </div>
      ) : items.length === 0 ? (
        <div className="glass rounded-2xl p-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-surface-700 flex items-center justify-center mx-auto mb-4 text-2xl">📄</div>
          <p className="font-display font-semibold text-slate-400 mb-1">No content yet</p>
          {canWrite && <p className="text-slate-600 text-sm">Click "New content" to create the first item</p>}
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item, i) => {
            const c = colorFor(item.created_by)
            return (
              <div key={item.ID} className="glass rounded-2xl p-5 flex gap-4 items-start group transition-all hover:border-surface-400/50"
                style={{animationDelay:`${i*40}ms`}}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold font-display flex-shrink-0 mt-0.5"
                  style={{background:`${c}22`, border:`1px solid ${c}33`, color:c}}>
                  {item.title?.[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <h3 className="font-display font-semibold text-white text-base leading-snug">{item.title}</h3>
                    <div className="flex items-center gap-2 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      {canWrite && (
                        <button onClick={() => startEdit(item)}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold font-display transition-all"
                          style={{color:'#818CF8', background:'rgba(99,102,241,0.1)', border:'1px solid rgba(99,102,241,0.2)'}}>
                          Edit
                        </button>
                      )}
                      {isAdmin && (
                        <button onClick={() => handleDelete(item.ID)}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold font-display transition-all"
                          style={{color:'#F43F5E', background:'rgba(244,63,94,0.08)', border:'1px solid rgba(244,63,94,0.2)'}}>
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="text-slate-400 text-sm leading-relaxed mb-3 line-clamp-3">{item.body}</p>
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="flex items-center gap-1.5 text-xs text-slate-600">
                      <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold font-display"
                        style={{background:`${colorFor(item.created_by)}22`, color:colorFor(item.created_by)}}>
                        {item.created_by?.[0]?.toUpperCase()}
                      </span>
                      {item.created_by}
                    </span>
                    <span className="text-slate-700 text-xs">·</span>
                    <span className="text-xs text-slate-700">{timeAgo(item.CreatedAt || item.created_at)}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}