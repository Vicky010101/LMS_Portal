import React, { useState } from 'react';
import { View, Text, TextInput, Button } from 'react-native';

export default function App(){
  const [mode,setMode] = useState('login');
  const [name,setName] = useState('');
  const [email,setEmail] = useState('');
  const [password,setPassword] = useState('');
  const [token,setToken] = useState(null);

  const API_BASE = 'http://10.0.2.2:5000/api'; // emulator: 10.0.2.2, replace with your computer IP for device

  const register = async () => {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ name, email, password })
    });
    const data = await res.json();
    if (data.token) setToken(data.token);
    else alert(data.msg || 'Register failed');
  };

  const login = async () => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (data.token) setToken(data.token);
    else alert(data.msg || 'Login failed');
  };

  if (token) return (
    <View style={{flex:1,justifyContent:'center',alignItems:'center'}}><Text>Logged in!</Text><Button title='Logout' onPress={()=>setToken(null)} /></View>
  );

  return (
    <View style={{padding:20, marginTop:50}}>
      {mode === 'signup' && <TextInput placeholder='Name' value={name} onChangeText={setName} />}
      <TextInput placeholder='Email' value={email} onChangeText={setEmail} />
      <TextInput placeholder='Password' secureTextEntry value={password} onChangeText={setPassword} />
      {mode === 'login' ? (
        <>
          <Button title='Login' onPress={login} />
          <Button title='Switch to Sign up' onPress={()=>setMode('signup')} />
        </>
      ) : (
        <>
          <Button title='Register' onPress={register} />
          <Button title='Switch to Login' onPress={()=>setMode('login')} />
        </>
      )}
    </View>
  );
}
