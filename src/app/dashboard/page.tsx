'use client'

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useUserStore } from '@/store/userStore';
import { Input } from '@/components/ui/input';
//import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface NotionUser {
  id: string;
  properties: {
    name?: { title?: { plain_text?: string }[] };
    email?: { email?: string };
    role?: { select?: { name?: string } };
    chef?: { select?: { name?: string } };
    photo?: { url?: string };
  };
}

export default function DashboardPage() {
  const { user: clerkUser } = useUser();
  const { fetchUsers, users, isLoading, error } = useUserStore();
  const [currentUser, setCurrentUser] = useState<NotionUser | null>(null);

  useEffect(() => {
    const loadAllUsers = async () => {
      try {
        // console.log('🔍 Fetching all users from database...');
        await fetchUsers();
        // console.log('✅ All users fetched successfully');
      } catch (error) {
        console.error('❌ Error fetching all users:', error);
      }
    };

    loadAllUsers();
  }, [fetchUsers]);

  // Find current user by comparing Clerk email with Notion data
  useEffect(() => {
    if (clerkUser?.emailAddresses?.[0]?.emailAddress && users.length > 0) {
      const userEmail = clerkUser.emailAddresses[0].emailAddress;
      // console.log('🔍 Looking for user with Clerk email:', userEmail);
      
      const foundUser = users.find((user: NotionUser) => {
        const notionEmail = user.properties?.email?.email;
        // console.log('🔍 Comparing with Notion email:', notionEmail);
        return notionEmail === userEmail;
      });

      if (foundUser) {
        // console.log('✅ Current user found in Notion:', foundUser);
        setCurrentUser(foundUser);
      } else {
        // console.log('❌ Current user not found in Notion for email:', userEmail);
        setCurrentUser(null);
      }
    }
  }, [clerkUser?.emailAddresses, users]);

  // Console log all users whenever they change
  useEffect(() => {
    if (users.length > 0) {
      // console.log('📊 All users in database:', users);
      // console.log('📊 Total users count:', users.length);
      
      // Log the raw first user to see the actual structure
      // console.log('🔍 Raw first user object:', users[0]);
      // console.log('🔍 Raw first user keys:', Object.keys(users[0]));
      
      // users.forEach((user, index) => {
      //   console.log(`👤 User ${index + 1}:`, user);
      // });
    }
  }, [users]);

  // Extract user data from Notion properties
  const getUserName = () => {
    if (!currentUser?.properties?.name?.title) return '';
    return currentUser.properties.name.title[0]?.plain_text || '';
  };

  const getUserEmail = () => {
    return currentUser?.properties?.email?.email || '';
  };

  const getUserRole = () => {
    return currentUser?.properties?.role?.select?.name || '';
  };

  // const getUserPhoto = () => {
  //   return currentUser?.properties?.photo?.url || '';
  // };

  const getIsChef = () => {
    return currentUser?.properties?.chef?.select?.name || '';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
        
        {currentUser ? (
          <div className="mt-6 space-y-4">
            <div className="flex items-center gap-4">
              <span className="font-medium text-gray-700 w-16">Name:</span>
              <Input 
                value={getUserName()}
                className="w-64"
                readOnly
                disabled
              />
            </div>
            <div className="flex items-center gap-4">
              <span className="font-medium text-gray-700 w-16">Email:</span>
              <Input 
                value={getUserEmail()}
                className="w-64"
                readOnly
                disabled
              />
            </div>
            <div className="flex items-center gap-4">
              <span className="font-medium text-gray-700 w-16">Role:</span>
              <Input 
                value={getUserRole()}
                className="w-64"
                readOnly
                disabled
              />
            </div>
            <div className="flex items-center gap-4">
              <span className="font-medium text-gray-700 w-16">Chef:</span>
              <Input 
                value={getIsChef()}
                className="w-64"
                readOnly
                disabled
              />
            </div>
            {/* <div className="flex items-center gap-4">
              <span className="font-medium text-gray-700 w-16">Image:</span>
              <Avatar className="w-12 h-12">
                <AvatarImage src={getUserPhoto()} alt="User avatar" />
                <AvatarFallback className="bg-gray-200 text-gray-600">
                  {getUserName().charAt(0).toUpperCase() || '👤'}
                </AvatarFallback>
              </Avatar>
            </div> */}
          </div>
        ) : (
          <div className="mt-6">
            <p className="text-orange-600">User not found in database</p>
            <p className="text-sm text-gray-500">Clerk email: {clerkUser?.emailAddresses?.[0]?.emailAddress}</p>
          </div>
        )}
        
      </div>
    </div>
  );
}
