(include-book "MAIN_FINAL_FIXED")
(include-book "testing" :dir :teachpacks)
(include-book "doublecheck" :dir :teachpacks)

;;Recovered Testing
(check-expect (Recovered 10000 (/ 1 3)) 10000/3)
(check-expect (Recovered 5000 (/ 1 5)) 5000/5)
(check-expect (Recovered 2400 (/ 1 6)) 2400/6)
(check-expect (Recovered 0 (/ 1 3)) 0)
(check-expect (Recovered 1203139 0) 0)

;;Deceased Testing
(check-expect (Deceased 10000 (/ 1 3)) 10000/3)
(check-expect (Deceased 5000 (/ 1 5)) 5000/5)
(check-expect (Deceased 2400 (/ 1 6)) 2400/6)
(check-expect (Deceased 0 (/ 1 3)) 0)
(check-expect (Deceased 1203139 0) 0)

;;Infected Testing
(check-expect (Infected 10000 (/ 1 3)) 10000/3)
(check-expect (Infected 5000 (/ 1 5)) 5000/5)
(check-expect (Infected 2400 (/ 1 6)) 2400/6)
(check-expect (Infected 0 (/ 1 3)) 0)
(check-expect (Infected 1203139 0) 0)

;;Theorem to verify the model
(defthm recovered-matches-model
   (implies (and (rationalp rate) (integerp infect) (> infect 0) (< 0 rate) (>= 1 rate))
            (= (Recovered infect rate) (* infect rate))))

;;Theorem to verify the model
(defthm infected-matches-model
   (implies (and (rationalp rate) (integerp infect) (> infect 0) (< 0 rate) (>= 1 rate))
            (= (Infected infect rate) (* infect rate))))

;;Theorem to verify the model
(defthm deceased-matches-model
   (implies (and (rationalp rate) (integerp infect) (> infect 0) (< 0 rate) (>= 1 rate))
            (= (Deceased infect rate) (* infect rate))))

;;Tests functionality of the output checker
(defthm checkOutput
   (implies (integerp x)
            (= (checkOut x) (if (< x 0) 0 x))))

(defproperty avl-get_returns_value
   (val :value(random-number))
   (equal (avl-get (avl-insert (empty-tree) "key" val ) "key") 
          val))


            