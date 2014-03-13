; John Johnson
(in-package "ACL2")
(include-book "list-utilities" :dir :teachpacks)
(include-book "io-utilities" :dir :teachpacks)

(set-state-ok t)

;-------------------------AVL Tree code from last semester ------------------------
(defun empty-tree? (tr) (not (consp tr)))
(defun height (tr) (if (empty-tree? tr) 0 (car tr)))
(defun key (tr) (cadr tr))
(defun data (tr) (caddr tr))
(defun left (tr) (cadddr tr))
(defun right (tr) (car (cddddr tr)))
(defun keys (tr)
  (if (empty-tree? tr)
      nil
      (append (keys (left tr)) (list (key tr)) (keys (right tr)))))

; Constructors
(defun empty-tree ( ) nil)
(defun mktree (k d lf rt)
		(list (+ 1 (max (height lf) (height rt))) k d lf rt))

; Contstraint detectors and key comparators
(defun key? (k) (Stringp k))	  ; to change representation of keys
(defun key< (j k) (String< j k))	  ;     alter definitions of key? and key<
(defun key> (j k) (key< k j))
(defun key= (j k)		  ; note: definitions of
  (and (not (key< j k))           ;    key>, key=, and key-member	
       (not (key> j k))))	  ;        get in line automatically
(defun key-member (k ks)
  (and (consp ks)
       (or (key= k (car ks))
           (key-member k (cdr ks)))))
(defun data? (d)
  (if d t t))
(defun mktree? (tr)
  (or (empty-tree? tr)
      (and (natp (height tr))		       ; height
           (= (height tr)                      ;   constraints
              (+ 1 (max (height (left tr))
                        (height (right tr)))))
           (key? (key tr))                     ; key constraint
           (data? (data tr))                   ; data constraint
           (mktree? (left tr))                   ; subtree
           (mktree? (right tr)))))               ;   constraints

; Key occurs in tree detector
(defun occurs-in-tree? (k tr)
  (and (key? k)
       (mktree? tr)
       (key-member k (keys tr))))
(defun alternate-occurs-in-tree? (k tr)
  (and (key? k)
       (mktree? tr)
       (not (empty-tree? tr))
       (or (key= k (key tr))
           (alternate-occurs-in-tree? k (left tr))
           (alternate-occurs-in-tree? k (right tr)))))

; all-key comparators
(defun all-keys< (k ks)
  (or (not (consp ks))
      (and (key< (car ks) k) (all-keys< k (cdr ks)))))

(defun all-keys> (k ks)
  (or (not (consp ks))
      (and (key> (car ks) k) (all-keys> k (cdr ks)))))

; definitions of ordered and balanced, and avl-tree detector
(defun ordered? (tr)
  (or (empty-tree? tr)
      (and (mktree? tr)
           (all-keys< (key tr) (keys (left tr)))
           (all-keys> (key tr) (keys (right tr)))
           (ordered? (left tr))
           (ordered? (right tr)))))

(defun balanced? (tr)
  (and (mktree? tr)
       (or (empty-tree? tr)
           (and (<= (abs (- (height (left tr)) (height (right tr)))) 1)
           (balanced? (left tr))
           (balanced? (right tr))))))

(defun avl-tree? (tr)
  (and (ordered? tr)
       (balanced? tr)))

; rotations
(defun easy-R (tr)
  (let* ((z (key tr)) (dz (data tr))
         (zL (left tr)) (zR (right tr))
         (x (key zL)) (dx (data zL))
         (xL (left zL)) (xR (right zL)))
     (mktree x dx xL (mktree z dz xR zR))))

(defun easy-L (tr)
  (let* ((z (key tr)) (dz (data tr))
         (zL (left tr)) (zR (right tr))
         (x (key zR)) (dx (data zR))
         (xL (left zR)) (xR (right zR)))
     (mktree x dx (mktree z dz zL xL) xR)))

(defun left-heavy? (tr)
  (and (mktree? tr)
       (not (empty-tree? tr))
       (= (height (left tr)) (+ 2 (height (right tr))))))

(defun outside-left-heavy? (tr)
  (and (left-heavy? tr)
       (or (= (height (left (left tr)))
              (height (right (left tr))))
           (= (height (left (left tr)))
              (+ 1 (height (right (left tr))))))))

(defun right-rotatable? (tr)
  (and (ordered? tr)
       (not (empty-tree? tr))
       (balanced? (left tr))
       (balanced? (right tr))
       (not (empty-tree? (left tr)))))

(defun right-heavy? (tr)
  (and (mktree? tr)
       (not (empty-tree? tr))
       (= (height (right tr)) (+ 2 (height (left tr))))))

(defun outside-right-heavy? (tr)
  (and (right-heavy? tr)
       (or (= (height (right (right tr))) (height (left (right tr))))
           (= (height (right (right tr))) (+ 1 (height (left (right tr))))))))

(defun left-rotatable? (tr)
  (and (mktree? tr)
       (not (empty-tree? tr))
       (balanced? (left tr))
       (balanced? (right tr))
       (not (empty-tree? (right tr)))))

(defun hard-R (tr)
  (let* ((z (key tr))
         (dz (data tr))
         (zL (left tr))
         (zR (right tr)))
     (easy-R (mktree z dz (easy-L zL) zR))))

(defun hard-L (tr)
  (let* ((z (key tr))
         (dz (data tr))
         (zL (left tr))
         (zR (right tr)))
     (easy-L (mktree z dz zL (easy-R zR)))))

(defun inside-left-heavy? (tr)
  (and (left-heavy? tr)
       (= (height (right (left tr)))
          (+ 1 (height (left (left tr)))))))

(defun hard-R-rotatable? (tr)
  (and (right-rotatable? tr)
       (left-rotatable? (left tr))))

(defun inside-right-heavy? (tr)
  (and (right-heavy? tr)
       (= (height (left (right tr)))
          (+ 1 (height (right (right tr)))))))

(defun hard-L-rotatable? (tr)
  (and (left-rotatable? tr)
       (right-rotatable? (right tr))))

(defun rot-R (tr)
  (let ((zL (left tr)))
     (if (< (height (left zL)) (height (right zL)))
         (hard-R tr)
         (easy-R tr))))

(defun rot-L (tr)
  (let ((zR (right tr)))
     (if (< (height (right zR)) (height (left zR)))
         (hard-L tr)
         (easy-L tr))))

; insertion
(defun avl-insert (tr new-key new-datum)
  (if (empty-tree? tr)
      (mktree new-key new-datum (empty-tree) (empty-tree))
      (if (key< new-key (key tr))
          (let* ((subL (avl-insert (left tr) new-key new-datum))
                 (subR (right tr))
                 (new-tr (mktree (key tr) (data tr) subL subR)))
             (if (= (height subL) (+ (height subR) 2))
                 (rot-R new-tr)
                        new-tr))
          (if (key> new-key (key tr))
              (let* ((subL (left tr))
                     (subR (avl-insert (right tr) new-key new-datum))
                     (new-tr (mktree (key tr) (data tr) subL subR)))
                 (if (= (height subR) (+ (height subL) 2))
                     (rot-L new-tr)
                     new-tr))
              (mktree new-key new-datum (left tr) (right tr))))))

; delete root - easy case
(defun easy-delete (tr)
  (right tr))

; tree shrinking
(defun shrink (tr)
  (if (empty-tree? (right tr))
      (list (key tr) (data tr) (left tr))
      (let* ((key-data-tree (shrink (right tr)))
             (k (car key-data-tree))
             (d (cadr key-data-tree))
             (subL (left tr))
             (subR (caddr key-data-tree))
             (shrunken-tr (mktree (key tr) (data tr) subL subR)))
         (if (= (height subL) (+ 2 (height subR)))
             (list k d (rot-R shrunken-tr))
             (list k d shrunken-tr)))))

(defun raise-sacrum (tr)
   (let* ((key-data-tree (shrink (left tr)))
          (k (car key-data-tree))
          (d (cadr key-data-tree))
          (subL (caddr key-data-tree))
          (subR (right tr))
          (new-tr (mktree k d subL subR)))
     (if (= (height subR) (+ 2 (height subL)))
         (rot-L new-tr)
         new-tr)))

; delete root - hard case
(defun delete-root (tr)
  (if (empty-tree? (left tr))
      (easy-delete tr)
      (raise-sacrum tr)))

; deletion
(defun avl-delete (tr k)
  (if (empty-tree? tr)
      tr
      (if (key< k (key tr))           ; key occurs in left subtree
          (let* ((new-left (avl-delete (left tr) k))
                 (new-tr (mktree (key tr) (data tr) new-left (right tr))))
             (if (= (height (right new-tr)) (+ 2 (height (left new-tr))))
                 (rot-L new-tr)
                 new-tr))
          (if (key> k (key tr))       ; key occurs in right subtree
              (let* ((new-right (avl-delete (right tr) k))
                     (new-tr (mktree (key tr) (data tr) (left tr) new-right)))
                     (if (= (height (left new-tr)) (+ 2 (height (right new-tr))))
                         (rot-R new-tr)
                         new-tr))
                 (delete-root tr)))))  ; key occurs at root

; retrieval
(defun avl-retrieve (tr k)  ; delivers key/data pair with key = k
  (if (empty-tree? tr)      ; or nil if k does not occur in tr
      nil                                 ; signal k not present in tree
      (if (key< k (key tr))
          (avl-retrieve (left tr) k)      ; search left subtree
          (if (key> k (key tr))
              (avl-retrieve (right tr) k) ; search right subtree
              (cons k (data tr))))))      ; k is at root, deliver key/data pair

(defun avl-flatten (tr)  ; delivers all key/data cons-pairs
  (if (empty-tree? tr)   ; with keys in increasing order
      nil
      (append (avl-flatten (left tr))
              (list (cons (key tr) (data tr)))
              (avl-flatten (right tr)))))

(defun occurs-in-pairs? (k pairs)
  (and (consp pairs)
       (or (key= k (caar pairs))
           (occurs-in-pairs? k (cdr pairs)))))

(defun increasing-pairs? (pairs)
  (or (not (consp (cdr pairs)))
      (and (key< (caar pairs) (caadr pairs))
           (increasing-pairs? (cdr pairs)))))
;###################################################################################
;    			JSON -> AVL tree

;Retrieves the value given the key
(defun avl-get (tr k)
   (cdr (avl-retrieve tr k)))

;Gets the string from the characters until the delimiter
(defun get-str (chrs key delim)
   (if (consp chrs)
       (if (or (equal (car chrs) delim) (equal (car chrs) #\}))
           key
           (get-str (cdr chrs) (append key (list(car chrs))) delim))
       nil))

;Gets the key by calling get-str using the quote mark as delimiter
(defun get-key (chrs)
   (chrs->str (get-str chrs nil #\')))

;Gets the value by calling get-str using the comma as delimiter
(defun get-val (chrs)
   (str->rat (chrs->str (get-str chrs nil #\,))))

;Gets the length of the string represented by the tree
(defun tree-length (chrs num)
   (if (equal (car chrs) #\})
       (+ num 2)
       (tree-length (cdr chrs) (+ num 1))))

(mutual-recursion
 ; Returns a list where the first element is the tree and the second is the char length of the tree
(defun val-tree (chrs tr)
   (if (consp chrs)
   	(if (equal (car chrs) #\')
        (if (equal (cadr chrs) #\:)
            (val-tree (cddr chrs) tr)
      	  (let* ((key (get-key (cdr chrs)))
           	     (vlist (val (nthcdr (+(length key) 2) chrs))); nthcdr-key length + 2 accounts for quotes on either side of the key.
              		(value (car vlist))
              		(vlen (cadr vlist)))
  		   		(val-tree (nthcdr (+ (length key) vlen 3) chrs) (avl-insert tr key value)))) ; Plus 4 accounts for the quotes on the key, the colon, and the comma
	    (if (equal (car chrs) #\})
         	    tr
              (val-tree (nthcdr 1 chrs) tr)))
       tr))
;Returns  a list where the first element is the value (Either a real number or a tree) and the second is the length of the string it represents.            
(defun val (chrs)
   (if (equal (car chrs) #\:)
       (val (cdr chrs))
       (if (equal (car chrs) #\{)
       	 (list (val-tree (cdr chrs) (empty-tree)) (tree-length chrs 0))
      	 (let*((value (get-val chrs)))
               (list value (length (rat->str value 0))))))))
;Parses JSON format input into an AVL tree structure.
(defun parse (json)
   (if (consp json)
       (if (equal (car json) #\{) 
           (parse (cdr json))
           (val-tree json (empty-tree)))
       nil))

;###################################################################################

; Combines AVL trees into one tree
(defun avl-combine-r (trs newTr)
   (if (consp trs)
       (let* ((tr (car trs))
              (key (car (keys tr))))
             (avl-combine-r (cdr trs)(avl-insert newTr (car (keys tr)) (avl-get tr key))))
       newTr))

(defun avl-combine (trs)
   (avl-combine-r trs (empty-tree)))

;###################################################################################
;    AVL tree -> JSON

(defun deparse (tr)
   



;###################################################################################
; Testing stuff

(defun numCharP (chr) ; Determines if the character is a valid number character
   (if (or (equal chr #\0)(equal chr #\1)(equal chr #\2)(equal chr #\3)(equal chr #\4)(equal chr #\5)(equal chr #\6)(equal chr #\7)(equal chr #\8)(equal chr #\9))
       t
       nil))
       

(defun valid-val (chrs) ;Determines if the sequence of characters until the , is a valid number
   (if (equal (car chrs) #\,)
       t
       (if (numCharP (car chrs))
           (valid-val (cdr chrs))
           nil)))

(defun jkv-pair? (json) ; returns length and validity
   (if (equal (cadr json) #\')
           (let* ((key-len (length (get-key (cddr json))))
                  (post-key (nthcdr (+ key-len 2) json))) ;Gets the length of the key including quotes
                 (if (equal (car post-key) #\:) ; Varifies that : comes after key
                     (if (equal (cadr post-key) #\{ )
                         (jobject? (cddr post-key))
                         (if (valid-val (cddr post-key))
                             

(defun jobject? (json) ; returns length and validity
   (if (equal (car json) #\{)
       (if (equal (cadr json) #\')
           (let* ((key-len (length (get-key (cddr json))))
                  (post-key (nthcdr (+ key-len 2) json))) ;Gets the length of the key including quotes
                 (if (equal (car post-key) #\:) ; Varifies that : comes after key
                     (if (equal (cadr post-key) #\{ )
                         (jobject? (cddr post-key))
                         


(defun json? (json)
      (if (consp json)
          (if (equal (car json) #\{)
              (let* ((object (jobject? (cdr json)))
                     (jlen (first object))
                     (valid (second object)))
                    valid)
                nil)
            nil))
           
   
   
   
   
   