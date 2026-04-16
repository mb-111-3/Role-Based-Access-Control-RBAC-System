import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import API from '../api/axios'
import toast from 'react-hot-toast'

export default function Register() {
  const [form, setForm] = useState({ username:'', email:'', password:'', confirm:'', role:'viewer' })
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handle = async (e) => {
    e.preventDefault()
    if (form.password !== form.confirm) return toast.error('Passwords do not match')
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters')
    setLoading(true)
    try {
      const res = await API.post('/register', { username:form.username, email:form.email, password:form.password, role:form.role })
      login(res.data.token, res.data.user)
      toast.success('Account created! Welcome aboard.')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed')
    } finally { setLoading(false) }
  }

  const f = (k) => ({ value: form[k], onChange: e => setForm({...form, [k]: e.target.value}) })

  return (
    <div className="min-h-screen bg-surface-950 flex">
      <div className="hidden lg:flex flex-col justify-between w-[420px] bg-surface-900 border-r border-surface-600/40 p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-30" style={{background:'radial-gradient(ellipse at 80% 30%, rgba(20,184,166,0.3) 0%, transparent 60%), radial-gradient(ellipse at 20% 80%, rgba(99,102,241,0.2) 0%, transparent 50%)'}} />
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-teal/20 border border-teal/30 flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#14B8A6" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          </div>
          <span className="font-display font-bold text-white text-xl">RBAC System</span>
        </div>
        <div className="relative z-10">
          <h2 className="font-display text-3xl font-bold text-white mb-3 leading-tight">Join with the<br/>right permissions</h2>
          <p className="text-slate-400 text-sm leading-relaxed mb-8">Self-registration grants Viewer or Editor roles. Admin accounts are managed internally.</p>
          <p className="text-xs font-display font-semibold text-slate-600 uppercase tracking-widest mb-3">Choose your role</p>
          <div className="space-y-3">
            {[{role:'viewer',label:'Viewer',desc:'Read-only access to all content',icon:'👁'},{role:'editor',label:'Editor',desc:'Create and edit content items',icon:'✏️'}].map(r=>(
              <button key={r.role} type="button" onClick={()=>setForm({...form,role:r.role})}
                className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl border transition-all ${form.role===r.role?'bg-teal/10 border-teal/40 text-white':'bg-surface-800 border-surface-600/50 text-slate-400 hover:border-teal/20'}`}>
                <span className="text-xl">{r.icon}</span>
                <div className="text-left">
                  <p className="text-sm font-semibold font-display">{r.label}</p>
                  <p className="text-xs text-slate-500">{r.desc}</p>
                </div>
                {form.role===r.role && (
                  <div className="ml-auto w-5 h-5 rounded-full bg-teal flex items-center justify-center flex-shrink-0">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm animate-fade-up">
          <div className="mb-8">
            <h1 className="font-display text-3xl font-bold text-white mb-2">Create account</h1>
            <p className="text-slate-400 text-sm">Get started with your free account today</p>
          </div>
          <form onSubmit={handle} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2 font-display">Username</label>
              <input className="input-field" type="text" placeholder="choose_a_username" required minLength={3} {...f('username')} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2 font-display">Email</label>
              <input className="input-field" type="email" placeholder="you@example.com" required {...f('email')} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2 font-display">Password</label>
              <input className="input-field" type="password" placeholder="Min. 6 characters" required {...f('password')} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2 font-display">Confirm password</label>
              <input className="input-field" type="password" placeholder="Repeat your password" required {...f('confirm')} />
            </div>
            <div className="lg:hidden">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2 font-display">Role</label>
              <select className="input-field" {...f('role')}>
                <option value="viewer">Viewer — Read only</option>
                <option value="editor">Editor — Create &amp; Edit</option>
              </select>
            </div>
            <div className="pt-2">
              <button type="submit" disabled={loading} className="btn-primary"
                style={{background:'linear-gradient(135deg,#14B8A6 0%,#0D9488 100%)'}}>
                {loading ? 'Creating account…' : 'Create account'}
              </button>
            </div>
          </form>
          <p className="mt-6 text-center text-sm text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="text-accent-light hover:text-white font-semibold transition-colors">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}