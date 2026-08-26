// ==========================================
// auth.api.js - Supabase Authentication & Profile API
// ==========================================
import { supabase } from './client.api.js';

// --- START loginWithCredentials ---
/**
 * Authenticates user via Email or Username with Password.
 * Looks up username from public.users to resolve email if username provided.
 */
export async function loginWithCredentials(usernameOrEmail, password) {
  try {
    let emailToAuth = usernameOrEmail.trim();

    // If input is not an email, lookup email from public.users by username
    if (!emailToAuth.includes('@')) {
      const { data: userProfile, error: lookupError } = await supabase
        .from('users')
        .select('email, role, is_active')
        .eq('username', emailToAuth)
        .maybeSingle();

      if (lookupError || !userProfile) {
        // Fallback: check if it's the default admin username
        if (emailToAuth.toLowerCase() === 'admin') {
          emailToAuth = 'admin@jorgypos.com';
        } else if (emailToAuth.toLowerCase() === 'mark.jordan') {
          emailToAuth = 'mark.jordan@jorgypos.com';
        } else {
          return { success: false, error: 'User account not found.' };
        }
      } else {
        if (!userProfile.is_active) {
          return { success: false, error: 'This account has been deactivated or resigned.' };
        }
        emailToAuth = userProfile.email;
      }
    }

    // Attempt Supabase Auth Sign In
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: emailToAuth,
      password: password
    });

    if (authError) {
      // If Supabase auth fails, provide graceful fallback for demo credentials
      if ((emailToAuth === 'admin@jorgypos.com' || usernameOrEmail.toLowerCase() === 'admin') && password === 'admin321!') {
        return {
          success: true,
          user: {
            id: 1,
            email: 'admin@jorgypos.com',
            username: 'admin',
            role: 'superadmin',
            full_name: 'Super Admin',
            theme_preference: 'dark'
          },
          role: 'superadmin'
        };
      }
      if ((emailToAuth === 'mark.jordan@jorgypos.com' || usernameOrEmail.toLowerCase() === 'mark.jordan') && password === 'password') {
        return {
          success: true,
          user: {
            id: 2,
            email: 'mark.jordan@jorgypos.com',
            username: 'mark.jordan',
            role: 'owner',
            full_name: 'Mark Jordan',
            theme_preference: 'light'
          },
          role: 'owner'
        };
      }

      return { success: false, error: authError.message || 'Invalid credentials.' };
    }

    // Fetch user profile data from public.users
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*, stores(*)')
      .eq('auth_user_id', authData.user.id)
      .maybeSingle();

    if (profileError || !profile) {
      // Fallback role check based on email
      const isSuper = emailToAuth === 'admin@jorgypos.com';
      return {
        success: true,
        session: authData.session,
        user: authData.user,
        role: isSuper ? 'superadmin' : 'owner'
      };
    }

    return {
      success: true,
      session: authData.session,
      user: profile,
      role: profile.role || 'cashier',
      store: profile.stores
    };
  } catch (err) {
    console.error('[Auth API Error]:', err);
    return { success: false, error: err.message || 'An unexpected error occurred.' };
  }
}
// --- END loginWithCredentials ---

// --- START loginWithPinCode ---
/**
 * Verifies 4-digit PIN for quick terminal access.
 */
export async function loginWithPinCode(pin) {
  try {
    // 1. Check SuperAdmin default PIN
    if (pin === '9999') {
      return {
        success: true,
        user: {
          id: 1,
          full_name: 'Super Admin',
          username: 'admin',
          email: 'admin@jorgypos.com',
          role: 'superadmin'
        },
        role: 'superadmin'
      };
    }

    // 2. Query public.users for matching active PIN
    const { data: userProfile, error } = await supabase
      .from('users')
      .select('*, stores(*)')
      .eq('pin_code', pin)
      .eq('is_active', true)
      .maybeSingle();

    if (error || !userProfile) {
      // Fallback demo PIN
      if (pin === '1234') {
        return {
          success: true,
          user: {
            id: 2,
            full_name: 'Mark Jordan',
            username: 'mark.jordan',
            email: 'mark.jordan@jorgypos.com',
            role: 'owner'
          },
          role: 'owner'
        };
      }
      return { success: false, error: 'Invalid PIN passcode.' };
    }

    return {
      success: true,
      user: userProfile,
      role: userProfile.role,
      store: userProfile.stores
    };
  } catch (err) {
    console.error('[PIN Auth API Error]:', err);
    return { success: false, error: err.message || 'PIN verification failed.' };
  }
}
// --- END loginWithPinCode ---

// --- START getCurrentSession ---
export async function getCurrentSession() {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error || !session) return null;
    return session;
  } catch (err) {
    return null;
  }
}
// --- END getCurrentSession ---

// --- START logoutUser ---
export async function logoutUser() {
  try {
    await supabase.auth.signOut();
  } catch (err) {
    console.warn('Sign out warning:', err);
  }
}
// --- END logoutUser ---
