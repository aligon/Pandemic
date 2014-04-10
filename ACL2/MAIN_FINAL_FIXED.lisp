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
   (chrs->str (get-str chrs nil #\")))

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
   	(if (equal (car chrs) #\")
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
(defun int->chrs (int)
   (str->chrs (rat->str int 5)))

   

(defun deparse-r(keys tr) ; Recursive function
   (if (consp keys)
       (let* ((value (avl-get tr (car keys)))) ; Value should be either a number or a tree
             (if (rationalp value) 
                 (if (consp (cdr keys)) ; If the value is a number
                     (append (list #\") (str->chrs (car keys))  (list #\" #\:) (int->chrs value) '(#\,) (deparse-r (cdr keys) tr)) ; Add ("<key>":<value>,) to the front of the rest of the expression
                     (append (list #\") (str->chrs (car keys))  (list #\" #\:) (int->chrs value) (deparse-r (cdr keys) tr))) ; Add ("<key>":<value>) to the front of the rest of the expression
                 (if (consp (cdr keys)) ; If the value is a tree
                     (append (list #\") (str->chrs (car keys)) (list #\" #\: #\{) (deparse-r (keys value) value) '(#\,) (deparse-r (cdr keys) tr)) ; Add ("<key>":{<tree representation>},) to the rest of the expression
                     (append (list #\") (str->chrs (car keys)) (list #\" #\: #\{) (deparse-r (keys value) value) (deparse-r (cdr keys) tr))))); Add ("<key>":{<tree representation>}) to the rest of the expression
       (list #\})));If there are noe more values in keys return } signifying the end of the tree
   
; Takes in an AVL-tree and returns the JSON string representing the tree
(defun deparse (tr) 
   (chrs->str (cons #\{ (deparse-r (keys tr) tr ))))



;; Calculates the number of recovered individuals in a given region
;; Parameters are the number of infected and the rate of recovery
(defun Recovered (infect ratelive)
   ;; The equation for recovery is rather simple, # of infected * rate of recovery
   (* infect ratelive)) 
;; end Recovered

;; Calculates the number of deceased indiviudals in a given region
;; Parameters are the number of infected and the rate of death
(defun Deceased (infect ratedie)
   ;; The equation for death is rather simple, # of infected * rate of death
   (* infect ratedie))
;; end Deceased

;; Calculates the number of infected individuals in a given region
;; The input parameters are the # of infected currently, rate of death,
;; rate of recovery, total # exposed in the region after travel, and rate of
;; disease progression from exposed to infected
;; This equation interfaces with Deceased and Recovered
(defun Infected (totalexposed rateprog)
   ;; The equation for infection is the # new infected (totalexposed * progression)
   ;; minus the # of infected recovered
   ;; minus the # of infected dead
   (* rateprog totalexposed))
;; end Infected

;crList is a list of contact rates for each age group of a region
;listInfected is a list of the infected for each age group in a region
;listPopulation is a list of the population for each age group in a region
;omegaE is a set value for the rates of exposed
(defun sumAgeGrp (crList listInfected listPopulation)
   (if (and  (> (len listInfected) 1)  (> (len listPopulation) 1))
       (+ (* (car crList) (/ (car listInfected) (car listPopulation))) (sumAgeGrp (cdr crList)(cdr listInfected)(cdr listPopulation)))
       (* (car crList) (/ (car listInfected) (car listPopulation)))
   )
)

;Susceptible function
;listInf is the list of infected for each age group in a respective region
;listPop is the list of population for each age group in a respective region
;infectR is the infection rate of the disease
;crList contract rate list, varying rates for each age group
;omegaS , omegaE are given rates for susceptible and exposed
(defun dSus (exposeR crList listInf listPop totalSus)
   (* (- 0 exposeR) (sumAgeGrp crList listInf listPop) totalSus)   
)

;Exposed function
;listInf is the list of infected for each age group in a respective region
;listPop is the list of population for each age group in a respective region
;infectR is the infection rate of the disease
;crList contract rate list, varying rates for each age group
;omegaS , omegaE are given rates for susceptible and exposed
;progR is the progression rate of the disease
(defun dExp (infectR crList listInf listPop susPop numInfected)
   (- (* infectR (sumAgeGrp crList listInf listPop) susPop) numInfected)
)

;Double checks the output
(defun checkOut (x)
   (if (< x 0)
       0
       x)
       )

;Returns the total population of the region input
(defun getPop (region)
  (list (+ (avl-get region "infected-adults") (avl-get region "exposed-adults") (avl-get region "susceptible-adults")) 
        (+ (avl-get region "infected-minors") (avl-get region "exposed-minors") (avl-get region "susceptible-minors"))
        )) 

(defun constructRegionOutput (region disease output)
   (if (empty-tree? region)
       nil
       (let* ((numNewDeadAD (Deceased (avl-get region "infected-adults") (avl-get disease "mortalityRate")))
          (numNewRecovAD (Recovered (avl-get region "infected-adults") (avl-get disease "recoveryRate")))
  		(adultNewinfect (Infected (avl-get region "exposed-adults") (avl-get disease "infectionRate")))
          
          (adultDeceased (+ (avl-get region "deceased-adults") numNewDeadAD))
          (adultRecov (+ (avl-get region "recovered-adults") numNewRecovAD))
          (adultTotalInfect (+ adultNewinfect (- (avl-get region "infected-adults") (+ numNewDeadAD numNewRecovAD))))
          (adultTotalExposed (+ (avl-get region "exposed-adults") 
                                (dExp (avl-get disease "exposureRate") (list (avl-get region "contact-adult-adult") (avl-get region "contact-adult-minor"))
                               (list (avl-get region "infected-adults") (avl-get region "infected-minors"))
                               (getPop region) (avl-get region "susceptible-adults") adultNewinfect)))
          (adultTotalSus (- (avl-get region "susceptible-adults") 
                            (dSus (avl-get disease "exposureRate") (list (avl-get region "contact-adult-adult") (avl-get region "contact-adult-minor"))
                            (list (avl-get region "infected-adults") (avl-get region "infected-minors"))
                            (getPop region) (avl-get region "susceptible-adults"))))
           
   		(numNewDeadCH (Deceased (avl-get region "infected-minors") (avl-get disease "mortalityRate")))
          (numNewRecovCH (Recovered (avl-get region "infected-minors") (avl-get disease "recoveryRate")))
  		(minorNewinfect (Infected (avl-get region "exposed-minors") (avl-get disease "infectionRate")))
          
          (minorDeceased (+ (avl-get region "deceased-minors") numNewDeadCH))
          (minorRecov (+ (avl-get region "recovered-minors") numNewRecovCH))
          (minorTotalInfect (+ minorNewinfect (- (avl-get region "infected-minors") (+ numNewDeadCH numNewRecovCH))))
          (minorTotalExposed (+ (avl-get region "exposed-minors") 
                                (dExp (avl-get disease "exposureRate") (list (avl-get region "contact-adult-minor") (avl-get region "contact-minor-minor"))
                               (list (avl-get region "infected-adults") (avl-get region "infected-minors"))
                               (getPop region) (avl-get region "susceptible-adults") adultNewinfect)))
          (minorTotalSus (- (avl-get region "susceptible-minors") 
                            (dSus (avl-get disease "exposureRate") (list (avl-get region "contact-adult-minor") (avl-get region "contact-minor-minor"))
                            (list (avl-get region "infected-adults") (avl-get region "infected-minors"))
                            (getPop region) (avl-get region "susceptible-minors"))))
    		
        (output (avl-insert output "infected-adults" (checkOut (floor adultTotalInfect 1))))
        (output (avl-insert output "exposed-adults" (checkOut (floor adultTotalExposed 1))))
      	(output (avl-insert output "susceptible-adults" (checkOut (floor adultTotalSus 1))))
         	(output (avl-insert output "deceased-adults" (checkOut (floor adultDeceased 1))))
         	(output (avl-insert output "recovered-adults" (checkOut (floor adultRecov 1))))
          
         	(output (avl-insert output "infected-minors" (checkOut (floor minorTotalInfect 1))))
        	(output (avl-insert output "exposed-minors" (checkOut (floor minorTotalExposed 1))))
       	(output (avl-insert output "susceptible-minors" (checkOut (floor minorTotalSus 1))))
         	(output (avl-insert output "deceased-minors" (checkOut (floor minorDeceased 1))))
         	(output (avl-insert output "recovered-minors" (checkOut (floor minorRecov 1)))))
          output
   		)))
  
             

(defun calculateRegions-r (mainTree regions)
   (if (consp regions)
       (if (equal (car regions) "disease")
           (calculateRegions-r mainTree (cdr regions))
       	 (cons (avl-insert (empty-tree) (car regions) (constructRegionOutput (avl-get mainTree (car regions)) (avl-get mainTree "disease") (empty-tree))) (calculateRegions-r mainTree (cdr regions))))
       nil))
(defun calculateRegions (mainTree)
   (let* ((regions (remove "disease" (keys mainTree))))
         (avl-combine (calculateRegions-r mainTree regions))))
  ; regions))
   
; Converts from string to the tree
(defun update (str)
   (let* ((tr (parse (str->chrs str))))
         (calculateRegions tr)))



;###################################################################################
; Input Output

(defun in-out (f-in f-out state)
    (mv-let (input-string error-open state)
           (file->string f-in state)
      (if error-open 
          (mv error-open state)
          (mv-let (error-close state)
                  (string-list->file f-out   (list (deparse (update input-string))) state); (parse (str->chrs input-string)))) state)
             (if error-close
                 (mv error-close state)
                 (mv (string-append "input file: "
                       (string-append f-in
					(string-append ", output file: " f-out)))
                     state))))))   
       
(defun main (input output state)
   (in-out input output state))
   