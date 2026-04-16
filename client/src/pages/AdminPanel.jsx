import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import API from '../api/axios'
import toast from 'react-hot-toast'

const roleMeta = {
  admin:  { color:'#818CF8', bg:'rgba(99,102,241,0.12)',  border:'rgba(99,102,241,0.25)'  },
  editor: { color:'#14B8A6', bg:'rgba(20,184,166,0.1)',   border:'rgba(20,184,166,0.25)'  },
  viewer: { color:'#94A3B8', bg:'rgba(148,163,184,0.08)', border:'rgba(148,163,184,0.15)' },
}

export default function AdminPanel() {
  const { user: me } = useAuth()
  const [users,    setUsers]    = useState([])
  const [loading,  setLoading]  = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({ username:'', email:'', password:'', role:'viewer' })

  const fetchUsers = async () => {
    setLoading(true)
    try { const r = await API.get('/users'); setUsers(r.data || []) }
    catch { toast.error('Failed to load users') }
    finally { setLoading(false) }
  }
  useEffect(() => { fetchUsers() }, [])

  const handleCreate = async (e) => {
    e.preventDefault(); setSubmitting(true)
    try {
      await API.post('/users', form)
      toast.success(`User "${form.username}" created successfully`)
      setForm({ username:'', email:'', password:'', role:'viewer' })
      setShowForm(false); fetchUsers()
    } catch (err) { toast.error(err.response?.data?.error || 'Failed to create user') }
    finally { setSubmitting(false) }
  }

  const handleRoleChange = async (id, role, username) => {
    try { await API.put(`/users/${id}`, { role }); toast.success(`${username}'s role updated to ${role}`); fetchUsers() }
    catch (err) { toast.error(err.response?.data?.error || 'Failed to update role') }
  }

  const handleDelete = async (id, username) => {
    if (!confirm(`Delete user "${username}"? This cannot be undone.`)) return
    try { await API.delete(`/users/${id}`); toast.success(`User "${username}" deleted`); fetchUsers() }
    catch (err) { toast.error(err.response?.data?.error || 'Failed to delete user') }
  }

  const stats = {
    total:   users.length,
    admins:  users.filter(u => u.role === 'admin').length,
    editors: users.filter(u => u.role === 'editor').length,
    viewers: users.filter(u => u.role === 'viewer').length,
  }

  return (
    <div className="animate-fade-up">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="font-display text-4xl font-bold text-white">Admin Panel</h1>
          <p className="text-slate-500 text-sm mt-1">Manage users and their access roles</p>
        </div>
        {!showForm && (
          <button onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white font-display transition-all hover:-translate-y-0.5"
            style={{background:'linear-gradient(135deg, #6366F1, #4F46E5)', boxShadow:'0 4px 20px rgba(99,102,241,0.3)'}}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Add user
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[['Total',stats.total,'#6366F1'],['Admins',stats.admins,'#818CF8'],['Editors',stats.editors,'#14B8A6'],['Viewers',stats.viewers,'#94A3B8']].map(([l,v,c])=>(
          <div key={l} className="glass rounded-xl p-4 transition-all hover:scale-[1.02]" style={{borderColor:`${c}20`}}>
            <p className="text-xs font-display font-semibold uppercase tracking-widest mb-2" style={{color:c}}>{l}</p>
            <p className="text-2xl font-display font-bold text-white">{v}</p>
          </div>
        ))}
      </div>

      {/* Create user form */}
      {showForm && (
        <div className="glass rounded-2xl p-6 mb-6 animate-fade-up" style={{border:'1px solid rgba(99,102,241,0.25)', boxShadow:'0 0 30px rgba(99,102,241,0.06)'}}>
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-display font-semibold text-white text-lg">Create new user</h2>
            <button onClick={() => setShowForm(false)}
              className="w-8 h-8 rounded-lg bg-surface-700 hover:bg-surface-600 flex items-center justify-center text-slate-400 hover:text-white transition-all text-lg leading-none">&times;</button>
          </div>
          <form onSubmit={handleCreate}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
              {[['Username','text','choose_username','username',3],['Email','email','user@example.com','email',0],['Password','password','Min. 6 characters','password',6]].map(([label,type,ph,key,min])=>(
                <div key={key}>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2 font-display">{label}</label>
                  <input className="input-field" type={type} placeholder={ph} required
                    minLength={min||undefined}
                    value={form[key]} onChange={e=>setForm({...form,[key]:e.target.value})} />
                </div>
              ))}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2 font-display">Role</label>
                <select className="input-field" value={form.role} onChange={e=>setForm({...form,role:e.target.value})}>
                  <option value="viewer">Viewer</option>
                  <option value="editor">Editor</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={submitting}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white font-display transition-all disabled:opacity-50"
                style={{background:'linear-gradient(135deg,#6366F1,#4F46E5)'}}>
                {submitting
                  ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>Creating…</>
                  : 'Create user'}
              </button>
              <button type="button" onClick={() => setShowForm(false)}
                className="px-6 py-2.5 rounded-xl text-sm text-slate-400 border border-surface-500 hover:border-slate-400 hover:text-slate-200 transition-all font-display">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Users table */}
      <div className="glass rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-surface-600/40 flex items-center justify-between">
          <h2 className="font-display font-semibold text-white">All users</h2>
          <span className="text-xs text-slate-500 font-display">{users.length} total</span>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-8 h-8 border-2 border-accent/20 border-t-accent rounded-full animate-spin"/>
            <p className="text-slate-600 text-sm font-display">Loading users…</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-surface-600/30">
                  {['#','User','Email','Role','Actions'].map(h => (
                    <th key={h} className="px-6 py-3.5 text-left text-xs font-display font-semibold text-slate-600 uppercase tracking-widest">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((u, i) => {
                  const rm = roleMeta[u.role] || roleMeta.viewer
                  const isMe = u.id === me?.id
                  return (
                    <tr key={u.id} className="border-b border-surface-600/20 last:border-0 hover:bg-surface-800/30 transition-colors group"
                      style={{animationDelay:`${i*30}ms`}}>
                      <td className="px-6 py-4 text-xs text-slate-700 font-mono">{u.id}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-bold font-display flex-shrink-0"
                            style={{background:`linear-gradient(135deg, ${rm.color}44, ${rm.color}22)`, border:`1px solid ${rm.border}`}}>
                            {u.username[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-white font-display flex items-center gap-2">
                              {u.username}
                              {isMe && <span className="text-[10px] px-1.5 py-0.5 rounded font-display font-bold" style={{background:'rgba(99,102,241,0.15)',color:'#818CF8'}}>YOU</span>}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">{u.email}</td>
                      <td className="px-6 py-4">
                        {isMe ? (
                          <span className="text-xs font-display font-semibold px-3 py-1.5 rounded-full capitalize"
                            style={{background:rm.bg, color:rm.color, border:`1px solid ${rm.border}`}}>
                            {u.role}
                          </span>
                        ) : (
                          <select defaultValue={u.role}
                            onChange={e => handleRoleChange(u.id, e.target.value, u.username)}
                            className="text-xs rounded-lg px-3 py-1.5 outline-none cursor-pointer font-display font-semibold capitalize transition-all appearance-none"
                            style={{background:rm.bg, color:rm.color, border:`1px solid ${rm.border}`}}>
                            <option value="viewer">viewer</option>
                            <option value="editor">editor</option>
                            <option value="admin">admin</option>
                          </select>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {!isMe && (
                          <button onClick={() => handleDelete(u.id, u.username)}
                            className="opacity-0 group-hover:opacity-100 text-xs font-semibold font-display px-3 py-1.5 rounded-lg transition-all"
                            style={{color:'#F43F5E', background:'rgba(244,63,94,0)', border:'1px solid transparent'}}
                            onMouseEnter={e=>{e.currentTarget.style.background='rgba(244,63,94,0.08)';e.currentTarget.style.borderColor='rgba(244,63,94,0.2)'}}
                            onMouseLeave={e=>{e.currentTarget.style.background='rgba(244,63,94,0)';e.currentTarget.style.borderColor='transparent'}}>
                            Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}