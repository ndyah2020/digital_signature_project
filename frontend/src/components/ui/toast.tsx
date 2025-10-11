import React, { forwardRef, Component } from 'react';
import * as ToastPrimitives from '@radix-ui/react-toast';
import { cva, type VariantProps } from 'class-variance-authority';
import { X } from 'lucide-react';
const ToastProvider = ToastPrimitives.Provider;
const ToastViewport = forwardRef<React.ElementRef<typeof ToastPrimitives.Viewport>, ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport>>(({
  className,
  ...props
}, ref) => <ToastPrimitives.Viewport ref={ref} className="fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]" {...props} />);
ToastViewport.displayName = ToastPrimitives.Viewport.displayName;
const toastVariants = cva('data-[swipe=move]:transition-none group relative pointer-events-auto flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full data-[state=closed]:slide-out-to-right-full', {
  variants: {
    variant: {
      default: 'bg-white border',
      destructive: 'group destructive border-destructive bg-destructive text-destructive-foreground'
    }
  },
  defaultVariants: {
    variant: 'default'
  }
});
const Toast = forwardRef<React.ElementRef<typeof ToastPrimitives.Root>, ComponentPropsWithoutRef<typeof ToastPrimitives.Root> & VariantProps<typeof toastVariants>>(({
  className,
  variant,
  ...props
}, ref) => {
  return <ToastPrimitives.Root ref={ref} className={toastVariants({
    variant
  })} {...props} />;
});
Toast.displayName = ToastPrimitives.Root.displayName;
const ToastAction = forwardRef<React.ElementRef<typeof ToastPrimitives.Action>, ComponentPropsWithoutRef<typeof ToastPrimitives.Action>>(({
  className,
  ...props
}, ref) => <ToastPrimitives.Action ref={ref} className="inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium ring-offset-background transition-colors hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 group-[.destructive]:border-destructive/30 group-[.destructive]:hover:border-destructive/30 group-[.destructive]:hover:bg-destructive group-[.destructive]:hover:text-destructive-foreground group-[.destructive]:focus:ring-destructive" {...props} />);
ToastAction.displayName = ToastPrimitives.Action.displayName;
const ToastClose = forwardRef<React.ElementRef<typeof ToastPrimitives.Close>, ComponentPropsWithoutRef<typeof ToastPrimitives.Close>>(({
  className,
  ...props
}, ref) => <ToastPrimitives.Close ref={ref} className="absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100" toast-close="" {...props}>
    <X className="h-4 w-4" />
  </ToastPrimitives.Close>);
ToastClose.displayName = ToastPrimitives.Close.displayName;
const ToastTitle = forwardRef<React.ElementRef<typeof ToastPrimitives.Title>, ComponentPropsWithoutRef<typeof ToastPrimitives.Title>>(({
  className,
  ...props
}, ref) => <ToastPrimitives.Title ref={ref} className="text-sm font-semibold" {...props} />);
ToastTitle.displayName = ToastPrimitives.Title.displayName;
const ToastDescription = forwardRef<React.ElementRef<typeof ToastPrimitives.Description>, ComponentPropsWithoutRef<typeof ToastPrimitives.Description>>(({
  className,
  ...props
}, ref) => <ToastPrimitives.Description ref={ref} className="text-sm opacity-90" {...props} />);
ToastDescription.displayName = ToastPrimitives.Description.displayName;
type ToastProps = ComponentPropsWithoutRef<typeof Toast>;
type ToastActionElement = React.ReactElement<typeof ToastAction>;
export { type ToastProps, type ToastActionElement, ToastProvider, ToastViewport, Toast, ToastTitle, ToastDescription, ToastClose, ToastAction };