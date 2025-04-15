/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {useState, useEffect} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StatusBar,
  useColorScheme,
  Alert,
  ActivityIndicator,
} from 'react-native';
import auth from '@react-native-firebase/auth';

interface Todo {
  id: string;
  text: string;
  completed: boolean;
}

function TodoScreen({onLogout}: {onLogout: () => void}): React.JSX.Element {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [inputText, setInputText] = useState('');
  const isDarkMode = useColorScheme() === 'dark';

  const handleLogout = async () => {
    try {
      await auth().signOut();
      onLogout();
    } catch (error) {
      Alert.alert('Error', 'Failed to log out');
    }
  };

  const addTodo = () => {
    if (inputText.trim().length === 0) return;
    
    const newTodo: Todo = {
      id: Date.now().toString(),
      text: inputText.trim(),
      completed: false,
    };
    
    setTodos([...todos, newTodo]);
    setInputText('');
  };

  const toggleTodo = (id: string) => {
    setTodos(
      todos.map(todo =>
        todo.id === id ? {...todo, completed: !todo.completed} : todo,
      ),
    );
  };

  const deleteTodo = (id: string) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  const renderTodo = ({item}: {item: Todo}) => (
    <View style={styles.todoItem}>
      <TouchableOpacity
        style={[styles.checkbox, item.completed && styles.checked]}
        onPress={() => toggleTodo(item.id)}
      />
      <Text
        style={[
          styles.todoText,
          item.completed && styles.completedTodoText,
        ]}>
        {item.text}
      </Text>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => deleteTodo(item.id)}>
        <Text style={styles.deleteButtonText}>×</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, isDarkMode && styles.darkContainer]}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={isDarkMode ? '#000000' : '#ffffff'}
      />
      <View style={styles.header}>
        <Text style={[styles.title, isDarkMode && styles.darkText]}>Todo List</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.inputContainer}>
        <TextInput
          style={[styles.input, isDarkMode && styles.darkInput]}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Add a new todo..."
          placeholderTextColor={isDarkMode ? '#666666' : '#999999'}
        />
        <TouchableOpacity style={styles.addButton} onPress={addTodo}>
          <Text style={styles.addButtonText}>Add</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={todos}
        renderItem={renderTodo}
        keyExtractor={item => item.id}
        style={styles.list}
      />
    </SafeAreaView>
  );
}

function AuthScreen({onLogin}: {onLogin: () => void}): React.JSX.Element {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const isDarkMode = useColorScheme() === 'dark';

  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log('Checking Firebase initialization...');
        const app = auth().app;
        console.log('Firebase initialized successfully:', app.name);
      } catch (error: any) {
        console.error('Firebase initialization error:', error);
        Alert.alert(
          'Firebase Error',
          `Initialization failed: ${error.message}`,
        );
      }
    };
    checkAuth();
  }, []);

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setIsLoading(true);
    try {
      if (isSignUp) {
        await auth().createUserWithEmailAndPassword(email, password);
      } else {
        await auth().signInWithEmailAndPassword(email, password);
      }
      onLogin();
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, isDarkMode && styles.darkContainer]}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={isDarkMode ? '#000000' : '#ffffff'}
      />
      <Text style={[styles.title, isDarkMode && styles.darkText]}>
        {isSignUp ? 'Sign Up' : 'Login'}
      </Text>
      <View style={styles.authContainer}>
        <TextInput
          style={[styles.input, isDarkMode && styles.darkInput, styles.authInput]}
          value={email}
          onChangeText={setEmail}
          placeholder="Email"
          placeholderTextColor={isDarkMode ? '#666666' : '#999999'}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          style={[styles.input, isDarkMode && styles.darkInput, styles.authInput]}
          value={password}
          onChangeText={setPassword}
          placeholder="Password"
          placeholderTextColor={isDarkMode ? '#666666' : '#999999'}
          secureTextEntry
        />
        {isLoading ? (
          <ActivityIndicator size="large" color="#007AFF" />
        ) : (
          <>
            <TouchableOpacity 
              style={[styles.addButton, styles.loginButton]} 
              onPress={handleAuth}>
              <Text style={styles.addButtonText}>
                {isSignUp ? 'Sign Up' : 'Login'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.switchAuthButton} 
              onPress={() => setIsSignUp(!isSignUp)}>
              <Text style={[styles.switchAuthText, isDarkMode && styles.darkText]}>
                {isSignUp ? 'Already have an account? Login' : "Don't have an account? Sign Up"}
              </Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

function App(): React.JSX.Element {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  React.useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(user => {
      setIsAuthenticated(!!user);
    });

    return unsubscribe;
  }, []);

  if (!isAuthenticated) {
    return <AuthScreen onLogin={() => setIsAuthenticated(true)} />;
  }

  return <TodoScreen onLogout={() => setIsAuthenticated(false)} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  darkContainer: {
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginVertical: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
  },
  darkText: {
    color: '#ffffff',
  },
  inputContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  authContainer: {
    padding: 20,
  },
  input: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: '#cccccc',
    borderRadius: 8,
    paddingHorizontal: 10,
    marginRight: 10,
    color: '#000000',
    backgroundColor: '#ffffff',
  },
  authInput: {
    marginBottom: 10,
    flex: undefined,
    marginRight: 0,
  },
  darkInput: {
    borderColor: '#333333',
    backgroundColor: '#333333',
    color: '#ffffff',
  },
  addButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  loginButton: {
    width: '100%',
    marginTop: 10,
  },
  logoutButton: {
    padding: 8,
  },
  logoutButtonText: {
    color: '#FF3B30',
    fontSize: 16,
    fontWeight: '600',
  },
  addButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  switchAuthButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  switchAuthText: {
    color: '#007AFF',
    fontSize: 14,
  },
  list: {
    flex: 1,
    paddingHorizontal: 20,
  },
  todoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#007AFF',
    borderRadius: 12,
    marginRight: 10,
  },
  checked: {
    backgroundColor: '#007AFF',
  },
  todoText: {
    flex: 1,
    fontSize: 16,
    color: '#000000',
  },
  completedTodoText: {
    textDecorationLine: 'line-through',
    color: '#999999',
  },
  deleteButton: {
    padding: 5,
  },
  deleteButtonText: {
    color: '#FF3B30',
    fontSize: 24,
    fontWeight: 'bold',
  },
});

export default App;
