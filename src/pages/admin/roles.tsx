import { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { db as rawDb } from '@/lib/firebase/firebase';
const db = rawDb!; // assert initialized
import { collection, getDocs, getDoc, doc, updateDoc } from 'firebase/firestore';

const AdminRolesPage: React.FC = () => {
  type User = {
    id: string;
    name?: string;
    email?: string;
    role: string;
    [key: string]: any;
  };

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // Wait for Firebase Auth to settle, then determine if the user is admin, then fetch users
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setAuthLoading(false);
        setIsAdmin(false);
        return;
      }
      try {
        const roleSnap = await getDoc(doc(db, 'roles', firebaseUser.uid));
        const role = roleSnap.exists() ? (roleSnap.data().role as string) : 'user';
        setIsAdmin(role === 'admin');
      } catch (err) {
        console.error('Unable to fetch current user role', err);
        setIsAdmin(false);
      } finally {
        setAuthLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const usersData = await Promise.all(usersSnapshot.docs.map(async (userDoc) => {
        const userId = userDoc.id;
        const roleDoc = await getDoc(doc(db, 'roles', userId));
        const role = roleDoc.exists() ? roleDoc.data().role : 'user';
        return {
          id: userId,
          role,
          ...userDoc.data(),
        };
      }));
      setUsers(usersData);
      setLoading(false);
    };

    if (!authLoading && isAdmin) {
      fetchUsers();
    }
  }, [authLoading, isAdmin]);

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await updateDoc(doc(db, 'roles', userId), { role: newRole });
      setUsers(users.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ));
    } catch (error) {
      console.error('Error updating role:', error);
    }
  };

  if (authLoading) {
    return <div>Checking authentication...</div>;
  }

  if (!isAdmin) {
    return <div>Unauthorized: Admin access required.</div>;
  }

  if (loading) {
    return <div>Loading users...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Manage User Roles</h1>
      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b">User</th>
            <th className="py-2 px-4 border-b">Email</th>
            <th className="py-2 px-4 border-b">Current Role</th>
            <th className="py-2 px-4 border-b">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td className="py-2 px-4 border-b">{user.name}</td>
              <td className="py-2 px-4 border-b">{user.email}</td>
              <td className="py-2 px-4 border-b">{user.role || 'user'}</td>
              <td className="py-2 px-4 border-b">
                <select 
                  value={user.role || 'user'} 
                  onChange={(e) => handleRoleChange(user.id, e.target.value)}
                  className="border rounded p-1"
                >
                  <option value="user">User</option>
                  <option value="teacher">Teacher</option>
                  <option value="admin">Admin</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminRolesPage;
