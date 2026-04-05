import { StyleSheet } from 'react-native';
import { theme } from '../../constants/theme';

export const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: theme.spacing.lg, 
    backgroundColor: theme.colors.card,  
    justifyContent: 'center',
    alignItems: 'center',  
  },
  logo: {
    width: 140,  
    height: 140,
    marginBottom: theme.spacing.md,
  },
  title: { 
    fontSize: 28, 
    fontWeight: 'bold', 
    color: theme.colors.primary,  
    marginBottom: theme.spacing.xl, 
    textAlign: 'center' 
  },
  input: { 
    width: '100%',  
    backgroundColor: theme.colors.background,  
    borderRadius: theme.borderRadius.md, 
    padding: theme.spacing.md, 
    fontSize: 16, 
    marginBottom: theme.spacing.md,
    color: theme.colors.text,
  },
  passwordContainer: { 
    width: '100%',
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: theme.colors.background, 
    borderRadius: theme.borderRadius.md, 
    marginBottom: theme.spacing.lg 
  },
  passwordInput: { 
    flex: 1, 
    padding: theme.spacing.md, 
    fontSize: 16,
    color: theme.colors.text,
  },
  eyeIcon: { 
    padding: theme.spacing.md 
  },
  button: { 
    width: '100%',
    backgroundColor: theme.colors.primary, 
    padding: theme.spacing.md, 
    borderRadius: theme.borderRadius.md, 
    alignItems: 'center', 
    marginBottom: theme.spacing.lg 
  },
  buttonText: { 
    color: theme.colors.card, 
    fontSize: 18, 
    fontWeight: 'bold' 
  },
  linkText: { 
    textAlign: 'center', 
    color: theme.colors.textLight, 
    fontSize: 16 
  },
  linkBold: { 
    color: theme.colors.primary, 
    fontWeight: 'bold' 
  }
});