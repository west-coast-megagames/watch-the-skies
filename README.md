��#   w a t c h - t h e - S k i e s  
  
 T h i s   i s   t h e   p r o j e c t   f i l e   f o r   t h e   W a t c h   t h e   S k i e s   P r o t o t y p e ,   m a d e   f o r   p r o j e c t   n e x u s .  
  
 [ - F i l e   S t r u c t u r e - ]  
 - -   r e a c t a p p   -   F r o n t   e n d   R e a c t   A p p l i c a t i o n s  
         ~   s r c   -   M a i n   s o u r c e   c o d e  
         ~   c o m p o n e n t s   -   A l l   r e a c t   c o m p o n e n t s   t h a t   m a k e   u p   t h e   U I  
                 ~   c o m m o n   -   R e u s a b l e   r e a c t   c o m p o n e n t s  
         ~   p a g e s   -   A l l   p a g e s   w i t h i n   t h e   p a g e   r o u t i n g   h i a r c h y  
  
 - -   s e r v e r   -   N o d e . j s   S e r v e r  
         ~   c o n f i g   -   A n y   k e y s   o r   c o n f i g u r a t i o n   f i l e s   f o r   t h e   s e r v e r  
         ~   m o d e l s   -   A l l   M o n g o o s e   d o c u m e n t   m o d e l s  
         ~   r o u t e s   -   A l l   E x p r e s s   r o u t e s  
                 ~   a p i   -   C u r r e n t l y   t h e   m a i n   r o u t e s   f o l d e r   ( U n l e a r   w h y )  
         ~   u t i l   -   A p p l i c a t i o n   f u n c t i o n s  
                 ~   i n i t - j s o n   -   I n i t i a l   L o a d   d a t a  
                 ~   s y s t e m s   -   G a m e   s y s t e m s  
                         ~   i n t e r c e p t   -   T h e   I n t e r c e p t i o n   s y s t e m   f o r   W T S  
                                 ~   L o g   -   L o g g i n g   f o r   t h e   I n t e r c e p t i o n   s y s t e m  
  
 [ - S c r i p t s   f o r   r u n n i n g - ]  
 - -   D e v :   n p m   r u n   d e v  
         ~   R u n s   t h e   r e a c t   d e v e l o p m e n t   s e r v e r   a n d   t h e   n o d e   s e r v e r   c o n c u r r e n t l y   w i t h   n o d e m o n   o n l i n e .  
 - -   A d d   E n v i o r n m e n t   V a r i a b l e   f o r   D E B U G  
         ~   $ e n v : D E B U G   =   " a p p : * "  
         ~   $ e n v : D E B U G _ C O L O R S = ' t r u e '  
-- Enviroment Variable to control running of initRefLoad
        ~   $env:RUN_INIT_REF = 'true'
 
