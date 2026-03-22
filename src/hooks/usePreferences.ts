import { useState, useEffect, useCallback } from 'react';
import { UserPreferences, LearningStyle, LearningProfile } from '../types';
import { get, set } from 'idb-keyval';

const DEFAULT_PROFILE: LearningProfile = {
  style: 'beginner',
  interests: [],
  weakTopics: [],
  questionFrequency: {},
  confusionCount: 0,
};

const DEFAULT_PREFERENCES: UserPreferences = {
  learningProfile: DEFAULT_PROFILE,
  privacyMode: false,
  theme: 'light',
};

const PREFS_KEY = 'aura_user_preferences';

export const usePreferences = () => {
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);

  useEffect(() => {
    const loadPrefs = async () => {
      const saved = await get(PREFS_KEY);
      if (saved) {
        setPreferences(saved);
      }
    };
    loadPrefs();
  }, []);

  const updatePreferences = useCallback(async (newPrefs: Partial<UserPreferences>) => {
    setPreferences(prev => {
      const updated = { ...prev, ...newPrefs };
      set(PREFS_KEY, updated);
      return updated;
    });
  }, []);

  const updateLearningProfile = useCallback(async (newProfile: Partial<LearningProfile>) => {
    setPreferences(prev => {
      const updated = {
        ...prev,
        learningProfile: { ...prev.learningProfile, ...newProfile }
      };
      set(PREFS_KEY, updated);
      return updated;
    });
  }, []);

  const trackInteraction = useCallback(async (content: string) => {
    setPreferences(prev => {
      const profile = { ...prev.learningProfile };
      
      // Track keywords for interests/weak topics
      const keywords: string[] = content.toLowerCase().match(/\b(\w+)\b/g) || [];
      keywords.forEach(word => {
        if (word.length > 4) {
          profile.questionFrequency[word] = (profile.questionFrequency[word] || 0) + 1;
        }
      });

      // Detect confusion
      const confusionKeywords = ['confused', 'don\'t understand', 'what is', 'explain again', 'stuck'];
      if (confusionKeywords.some(k => content.toLowerCase().includes(k))) {
        profile.confusionCount += 1;
      }

      const updated = { ...prev, learningProfile: profile };
      set(PREFS_KEY, updated);
      return updated;
    });
  }, []);

  const resetProfile = useCallback(async () => {
    setPreferences(prev => {
      const updated = { ...prev, learningProfile: DEFAULT_PROFILE };
      set(PREFS_KEY, updated);
      return updated;
    });
  }, []);

  return {
    preferences,
    updatePreferences,
    updateLearningProfile,
    trackInteraction,
    resetProfile,
  };
};
