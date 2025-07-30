import { initializeDatabase } from '@/lib/db/init';

export async function initializeApplication() {
  console.log('🚀 Starting application initialization...');
  
  try {
    // Initialize database
    await initializeDatabase();
    
    console.log('✅ Application initialized successfully');
    return { success: true };
    
  } catch (error) {
    console.error('❌ Application initialization failed:', error);
    
    // In production runtime (but not build time), you might want to exit the process
    if (process.env.NODE_ENV === 'production' && process.env.NEXT_PHASE !== 'phase-production-build') {
      console.error('🔴 Exiting due to initialization failure in production');
      process.exit(1);
    }
    
    return { success: false, error };
  }
}

// Initialize only once when the module is first loaded
let isInitialized = false;
let initializationPromise: Promise<any> | null = null;

export async function ensureInitialized() {
  if (isInitialized) {
    return { success: true, cached: true };
  }
  
  if (initializationPromise) {
    return await initializationPromise;
  }
  
  initializationPromise = initializeApplication().then((result) => {
    if (result.success) {
      isInitialized = true;
    }
    return result;
  });
  
  return await initializationPromise;
}

// Auto-initialize when this module is loaded (server-side only, but not during build)
if (typeof window === 'undefined' && process.env.NEXT_PHASE !== 'phase-production-build') {
  // Run initialization in background, don't block module loading
  ensureInitialized().catch((error) => {
    console.error('🔴 Failed to initialize application:', error);
  });
}