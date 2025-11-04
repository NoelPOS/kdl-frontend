'use client';

import { useEffect, useState } from 'react';
import { useLiff } from '@/context/liff/liff.context';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

/**
 * LIFF Child Selector Page
 * 
 * Purpose:
 * - Display all children of the logged-in parent
 * - Allow parent to select which child's courses to view
 * - Show student profile pictures and IDs
 * 
 * Design: Card-based grid layout with search functionality
 */

interface Student {
  id: number;
  name: string;
  nickname: string;
  studentId: string;
  profilePicture?: string;
  phone?: string;
}

interface ParentChild {
  id: number;
  parentId: number;
  studentId: number;
  isPrimary: boolean;
  student: Student;
}

export default function ChildrenPage() {
  const { parentProfile } = useLiff();
  const router = useRouter();
  
  const [children, setChildren] = useState<ParentChild[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchChildren = async () => {
    if (!parentProfile) return;

    try {
      setIsLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/parents/${parentProfile.id}/children?limit=100`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch children');
      }

      const data = await response.json();
      setChildren(data.children || []);
    } catch (error) {
      console.error('Error fetching children:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (parentProfile) {
      fetchChildren();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parentProfile]);

  const filteredChildren = children.filter((child) =>
    child.student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    child.student.nickname.toLowerCase().includes(searchQuery.toLowerCase()) ||
    child.student.studentId.includes(searchQuery)
  );

  const handleSelectChild = (studentId: number) => {
    router.push(`/liff/my-courses?studentId=${studentId}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent mb-4"></div>
          <p className="text-gray-600">Loading children...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-6 py-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">👨‍👩‍👧‍👦</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">My Children</h1>
              <p className="text-sm text-gray-500">
                {parentProfile?.name || 'Parent'}
              </p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or ID..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            <svg
              className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Children Grid */}
      <div className="px-6 pt-6">
        {filteredChildren.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-gray-500">
              {searchQuery ? 'No children found matching your search' : 'No children found'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {filteredChildren.map((child) => (
              <button
                key={child.id}
                onClick={() => handleSelectChild(child.studentId)}
                className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-200 transform hover:scale-105 active:scale-95 overflow-hidden"
              >
                {/* Profile Picture */}
                <div className="relative aspect-square bg-gradient-to-br from-green-100 to-blue-100">
                  {child.student.profilePicture ? (
                    <Image
                      src={child.student.profilePicture}
                      alt={child.student.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-6xl">👤</span>
                    </div>
                  )}
                  
                  {/* Primary Badge */}
                  {child.isPrimary && (
                    <div className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full">
                      ⭐ Primary
                    </div>
                  )}
                </div>

                {/* Child Info */}
                <div className="p-4">
                  <h3 className="font-bold text-gray-900 mb-1 truncate">
                    {child.student.name}
                  </h3>
                  <p className="text-sm text-gray-500 mb-2">
                    {child.student.nickname}
                  </p>
                  <div className="bg-gray-100 rounded-lg px-3 py-1 inline-block">
                    <p className="text-xs font-mono text-gray-700">
                      ID: {child.student.studentId}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Info Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-3">
        <p className="text-xs text-center text-gray-500">
          Select a child to view their courses and schedules
        </p>
      </div>
    </div>
  );
}
