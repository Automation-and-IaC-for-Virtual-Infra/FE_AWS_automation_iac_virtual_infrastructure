'use client'

import { useState } from 'react'
import { CognitoUserAttribute } from 'amazon-cognito-identity-js'
import { userPool } from '@/lib/cognito'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) return setError('Mật khẩu nhập lại không khớp')

    const attributes = [new CognitoUserAttribute({ Name: 'email', Value: email })]

    userPool.signUp(email, password, attributes, [], (err) => {
      if (err) return setError(err.message || 'Đăng ký thất bại')

      // ✅ Đưa sang trang nhập mã xác nhận
      window.location.href = `/confirm?email=${encodeURIComponent(email)}`
    })
  }

  return (
    <div style={styles.container}>
      <form onSubmit={handleSignUp} style={styles.form}>
        <h2>Đăng ký</h2>
        {error && <p style={styles.error}>{error}</p>}

        <input
          style={styles.input}
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          style={styles.input}
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <input
          style={styles.input}
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />

        <button style={styles.button} type="submit">
          Đăng ký
        </button>
        <p style={styles.link} onClick={() => (window.location.href = '/login')}>
          Đã có tài khoản? Đăng nhập
        </p>
      </form>
    </div>
  )
}

const styles: any = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    background: '#f3f4f6',
  },
  form: {
    width: '350px',
    padding: '30px',
    borderRadius: '10px',
    background: 'white',
    boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
    textAlign: 'center',
  },
  input: {
    width: '100%',
    padding: '12px',
    margin: '10px 0',
    borderRadius: '6px',
    border: '1px solid #ccc',
    fontSize: '14px',
  },
  button: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#0070f3',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '15px',
  },
  error: { color: 'red', marginBottom: '10px' },
  link: { marginTop: 10, cursor: 'pointer', color: '#0070f3' },
}
