import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export default function SupabaseCheck() {
  const [isCorrectProject, setIsCorrectProject] = useState<boolean | null>(null);

  useEffect(() => {
    // Check if we're connected to the right project
    const checkConnection = async () => {
      try {
        // Try to query a table that exists in your project
        const { error } = await supabase.from('members').select('id').limit(1);
        
        if (error && error.message.includes('does not exist')) {
          // Table doesn't exist = wrong project
          setIsCorrectProject(false);
        } else {
          // Table exists or other error = probably right project
          setIsCorrectProject(true);
        }
      } catch (err) {
        setIsCorrectProject(false);
      }
    };

    checkConnection();
  }, []);

  if (isCorrectProject === false) {
    return (
      <div className="fixed inset-0 bg-red-600 z-[9999] flex items-center justify-center p-4">
        <div className="bg-white rounded-xl p-8 max-w-md text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">⚠️ WRONG DATABASE!</h1>
          <p className="text-gray-700 mb-4">
            The app is connected to the <strong>wrong Supabase project</strong>.
          </p>
          <p className="text-sm text-gray-600 mb-6">
            Bolt has changed the .env file again. Manual fix required.
          </p>
          <div className="bg-gray-100 p-4 rounded-lg text-left text-xs">
            <p className="font-mono">Expected: fkpwibismkewrezgchbq</p>
          </div>
        </div>
      </div>
    );
  }

  return null;
}