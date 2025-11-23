'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { ArrowRight, ArrowLeft, User, Globe, Mic, Volume2, Shield, Check } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { SUPPORTED_LANGUAGES, VOICE_PERSONAS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import type { User } from '@/types';

interface OnboardingData {
  displayName: string;
  preferredLanguage: string;
  voicePersona: 'natural' | 'professional' | 'friendly';
  defaultTargetLanguage: string;
  privacyOptIn: boolean;
}

const steps = [
  {
    id: 'displayName',
    title: 'What should we call you?',
    description: 'Your display name will be shown in your PolyDub account.',
    icon: User,
  },
  {
    id: 'preferredLanguage',
    title: 'Choose your interface language',
    description: 'Select the language you prefer for the PolyDub interface.',
    icon: Globe,
  },
  {
    id: 'voicePersona',
    title: 'Select your voice style',
    description: 'Choose the default voice style for your dubbed content.',
    icon: Mic,
  },
  {
    id: 'defaultTargetLanguage',
    title: 'Default target language',
    description: 'Choose your most frequently used target language for dubbing.',
    icon: Volume2,
  },
  {
    id: 'privacy',
    title: 'Privacy preferences',
    description: 'Help us improve PolyDub while respecting your privacy.',
    icon: Shield,
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { user, updateProfile, isUpdatingProfile } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid },
  } = useForm<OnboardingData>({
    defaultValues: {
      displayName: user?.displayName || '',
      preferredLanguage: user?.preferredLanguage || 'en',
      voicePersona: user?.voicePersona || 'natural',
      defaultTargetLanguage: user?.defaultTargetLanguage || 'en',
      privacyOptIn: user?.privacyOptIn || false,
    },
    mode: 'onChange',
  });

  const formData = watch();

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCompletedSteps(prev => new Set([...prev, currentStep]));
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const onSubmit = async (data: OnboardingData) => {
    try {
      await updateProfile(data);
      toast.success('Profile completed successfully!');
      router.push('/dashboard');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update profile');
    }
  };

  const skipOnboarding = async () => {
    try {
      await updateProfile({ onboardingCompleted: true });
      router.push('/dashboard');
    } catch (error) {
      toast.error('Failed to skip onboarding');
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 0: // displayName
        return formData.displayName && formData.displayName.length >= 2 && formData.displayName.length <= 50;
      case 1: // preferredLanguage
        return formData.preferredLanguage;
      case 2: // voicePersona
        return formData.voicePersona;
      case 3: // defaultTargetLanguage
        return formData.defaultTargetLanguage;
      case 4: // privacy
        return true; // Privacy step is always valid (opt-in is optional)
      default:
        return false;
    }
  };

  const StepIcon = steps[currentStep].icon;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Mic className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold">PolyDub</span>
            </div>
            <button
              onClick={skipOnboarding}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Skip for now
            </button>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="border-b bg-muted/30">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const isCompleted = completedSteps.has(index);
              const isCurrent = index === currentStep;
              const isPast = index < currentStep;

              return (
                <div key={step.id} className="flex items-center">
                  <div
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-full border-2 font-medium transition-colors",
                      isCurrent && "border-primary bg-primary text-primary-foreground",
                      isCompleted && "border-primary bg-primary text-primary-foreground",
                      isPast && "border-primary text-primary",
                      !isCurrent && !isCompleted && "border-muted-foreground text-muted-foreground"
                    )}
                  >
                    {isCompleted ? <Check className="h-5 w-5" /> : index + 1}
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={cn(
                        "mx-4 h-0.5 w-16 transition-colors",
                        index < currentStep ? "bg-primary" : "bg-muted"
                      )}
                    />
                  )}
                </div>
              );
            })}
          </div>
          <div className="mt-4">
            <h1 className="text-2xl font-semibold">{steps[currentStep].title}</h1>
            <p className="text-muted-foreground mt-1">{steps[currentStep].description}</p>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-2xl">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Step 1: Display Name */}
            {currentStep === 0 && (
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                    <User className="h-8 w-8 text-primary" />
                  </div>
                  <div className="flex-1">
                    <input
                      {...register('displayName', {
                        required: 'Display name is required',
                        minLength: {
                          value: 2,
                          message: 'Display name must be at least 2 characters',
                        },
                        maxLength: {
                          value: 50,
                          message: 'Display name must be less than 50 characters',
                        },
                      })}
                      type="text"
                      placeholder="Enter your display name"
                      className="w-full rounded-lg border border-input bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    {errors.displayName && (
                      <p className="mt-1 text-sm text-destructive">{errors.displayName.message}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Preferred Language */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="grid gap-3">
                  {SUPPORTED_LANGUAGES.slice(0, 10).map((language) => (
                    <label
                      key={language.code}
                      className={cn(
                        "flex items-center gap-3 rounded-lg border border-input p-4 cursor-pointer transition-colors hover:bg-accent",
                        formData.preferredLanguage === language.code && "border-primary bg-primary/5"
                      )}
                    >
                      <input
                        {...register('preferredLanguage', { required: true })}
                        type="radio"
                        value={language.code}
                        className="h-4 w-4 text-primary"
                      />
                      <div className="flex-1">
                        <div className="font-medium">{language.name}</div>
                        <div className="text-sm text-muted-foreground">{language.nativeName}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3: Voice Persona */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  {Object.values(VOICE_PERSONAS).map((persona) => (
                    <label
                      key={persona.id}
                      className={cn(
                        "flex flex-col items-center gap-3 rounded-lg border border-input p-6 cursor-pointer transition-colors hover:bg-accent",
                        formData.voicePersona === persona.id && "border-primary bg-primary/5"
                      )}
                    >
                      <input
                        {...register('voicePersona', { required: true })}
                        type="radio"
                        value={persona.id}
                        className="h-4 w-4 text-primary"
                      />
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                        <Mic className="h-6 w-6 text-primary" />
                      </div>
                      <div className="text-center">
                        <div className="font-medium">{persona.name}</div>
                        <div className="text-sm text-muted-foreground mt-1">{persona.description}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Step 4: Default Target Language */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <div className="grid gap-3">
                  {SUPPORTED_LANGUAGES.slice(0, 15).map((language) => (
                    <label
                      key={language.code}
                      className={cn(
                        "flex items-center gap-3 rounded-lg border border-input p-4 cursor-pointer transition-colors hover:bg-accent",
                        formData.defaultTargetLanguage === language.code && "border-primary bg-primary/5"
                      )}
                    >
                      <input
                        {...register('defaultTargetLanguage', { required: true })}
                        type="radio"
                        value={language.code}
                        className="h-4 w-4 text-primary"
                      />
                      <div className="flex-1">
                        <div className="font-medium">{language.name}</div>
                        <div className="text-sm text-muted-foreground">{language.nativeName}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Step 5: Privacy */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                    <Shield className="h-8 w-8 text-primary" />
                  </div>
                  <div className="flex-1 space-y-4">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        {...register('privacyOptIn')}
                        type="checkbox"
                        className="mt-1 h-4 w-4 text-primary rounded"
                      />
                      <div className="text-sm">
                        <div className="font-medium mb-1">Help improve PolyDub</div>
                        <div className="text-muted-foreground">
                          Allow us to use anonymized data from your dubbing sessions to improve our AI models.
                          Your personal information and content will never be shared or sold.
                        </div>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="rounded-lg border border-muted bg-muted/30 p-4">
                  <h3 className="font-medium mb-2">Your privacy matters</h3>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Your files are encrypted and stored securely</li>
                    <li>• You can delete your data at any time</li>
                    <li>• We never sell your personal information</li>
                    <li>• Opt-out anytime in your settings</li>
                  </ul>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-8 border-t">
              <button
                type="button"
                onClick={prevStep}
                disabled={currentStep === 0}
                className={cn(
                  "flex items-center gap-2 px-6 py-3 rounded-full border border-input bg-background hover:bg-accent hover:text-accent-foreground",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  "transition-colors"
                )}
              >
                <ArrowLeft className="h-4 w-4" />
                Previous
              </button>

              {currentStep === steps.length - 1 ? (
                <button
                  type="submit"
                  disabled={!isValid || isUpdatingProfile}
                  className={cn(
                    "flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground hover:bg-primary/90",
                    "disabled:opacity-50 disabled:cursor-not-allowed",
                    "transition-colors"
                  )}
                >
                  {isUpdatingProfile ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                      Saving...
                    </>
                  ) : (
                    <>
                      Complete Setup
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={nextStep}
                  disabled={!isStepValid()}
                  className={cn(
                    "flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground hover:bg-primary/90",
                    "disabled:opacity-50 disabled:cursor-not-allowed",
                    "transition-colors"
                  )}
                >
                  Next
                  <ArrowRight className="h-4 w-4" />
                </button>
              )}
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}