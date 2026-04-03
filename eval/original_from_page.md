Representation theory is a branch of mathematics that studies abstract algebraic structures by representing their elements as linear transformations of vector spaces, and studies modules over these abstract algebraic structures.[1][2] In essence, a representation makes an abstract algebraic object more concrete by describing its elements by matrices and their algebraic operations (for example, matrix addition, matrix multiplication).

The algebraic objects amenable to such a description include groups, associative algebras and Lie algebras. The most prominent of these (and historically the first) is the representation theory of groups, in which elements of a group are represented by invertible matrices such that the group operation is matrix multiplication.[3][4]

Representation theory is a useful method because it reduces problems in abstract algebra to problems in linear algebra, a subject that is well understood.[5][6] Representations of more abstract objects in terms of familiar linear algebra can elucidate properties and simplify calculations within more abstract theories. For instance, representing a group by an infinite-dimensional Hilbert space allows methods of analysis to be applied to the theory of groups.[7][8] Furthermore, representation theory is important in physics because it can describe how the symmetry group of a physical system affects the solutions of equations describing that system.[9]

Representation theory is pervasive across fields of mathematics. The applications of representation theory are diverse.[10] In addition to its impact on algebra, representation theory

- generalizes Fourier analysis via harmonic analysis,[11]
- is connected to geometry via invariant theory and the Erlangen program,[12]
- has an impact in number theory via automorphic forms and the Langlands program.[13]
There are many approaches to representation theory: the same objects can be studied using methods from algebraic geometry, module theory, analytic number theory, differential geometry, operator theory, algebraic combinatorics and topology.[14]

The success of representation theory has led to numerous generalizations. One of the most general is in category theory.[15] The algebraic objects to which representation theory applies can be viewed as particular kinds of categories, and the representations as functors from the object category to the category of vector spaces.[4] This description points to two natural generalizations: first, the algebraic objects can be replaced by more general categories; second, the target category of vector spaces can be replaced by other well-understood categories.

## Definitions and concepts

Let 
  
    
      
        V
      
    
    {\displaystyle V}
  
 be a vector space over a field 
  
    
      
        
          F
        
      
    
    {\displaystyle \mathbb {F} }
  
.[6] For instance, suppose 
  
    
      
        V
      
    
    {\displaystyle V}
  
 is 
  
    
      
        
          
            R
          
          
            n
          
        
      
    
    {\displaystyle \mathbb {R} ^{n}}
  
 or 
  
    
      
        
          
            C
          
          
            n
          
        
      
    
    {\displaystyle \mathbb {C} ^{n}}
  
, the standard n-dimensional space of column vectors over the real or complex numbers, respectively. In this case, the idea of representation theory is to do abstract algebra concretely by using 
  
    
      
        n
        ×
        n
      
    
    {\displaystyle n\times n}
  
 matrices of real or complex numbers.

There are three main sorts of algebraic objects for which this can be done: groups, associative algebras and Lie algebras.[16][4]

- The set of all invertible 
  
    
      
        n
        ×
        n
      
    
    {\displaystyle n\times n}
  
 matrices is a group under matrix multiplication, and the representation theory of groups analyzes a group by describing ("representing") its elements in terms of invertible matrices.
- Matrix addition and multiplication make the set of all 
  
    
      
        n
        ×
        n
      
    
    {\displaystyle n\times n}
  
 matrices into an associative algebra, and hence there is a corresponding representation theory of associative algebras.
- If we replace matrix multiplication 
  
    
      
        M
        N
      
    
    {\displaystyle MN}
  
 by the matrix commutator 
  
    
      
        M
        N
        −
        N
        M
      
    
    {\displaystyle MN-NM}
  
, then the 
  
    
      
        n
        ×
        n
      
    
    {\displaystyle n\times n}
  
 matrices become instead a Lie algebra, leading to a representation theory of Lie algebras.
This generalizes to any field 
  
    
      
        
          F
        
      
    
    {\displaystyle \mathbb {F} }
  
 and any vector space 
  
    
      
        V
      
    
    {\displaystyle V}
  
 over 
  
    
      
        
          F
        
      
    
    {\displaystyle \mathbb {F} }
  
, with linear maps replacing matrices and composition replacing matrix multiplication: there is a group 
  
    
      
        
          GL
        
        (
        V
        ,
        
          F
        
        )
      
    
    {\displaystyle {\text{GL}}(V,\mathbb {F} )}
  
 of automorphisms of 
  
    
      
        V
      
    
    {\displaystyle V}
  
, an associative algebra 
  
    
      
        
          
            End
          
          
            
              F
            
          
        
        (
        V
        )
      
    
    {\displaystyle {\text{End}}_{\mathbb {F} }(V)}
  
 of all endomorphisms of 
  
    
      
        V
      
    
    {\displaystyle V}
  
, and a corresponding Lie algebra 
  
    
      
        
          
            g
            l
          
        
        (
        V
        ,
        
          F
        
        )
      
    
    {\displaystyle {\mathfrak {gl}}(V,\mathbb {F} )}
  
.

### Definition

#### Action

There are two ways to define a representation.[17] The first uses the idea of an action, generalizing the way that matrices act on column vectors by matrix multiplication.

A representation of a group 
  
    
      
        G
      
    
    {\displaystyle G}
  
 or (associative or Lie) algebra 
  
    
      
        A
      
    
    {\displaystyle A}
  
 on a vector space 
  
    
      
        V
      
    
    {\displaystyle V}
  
 is a map

  
    
      
        Φ
        :
        G
        ×
        V
        →
        V
        
        
          or
        
        
        Φ
        :
        A
        ×
        V
        →
        V
      
    
    {\displaystyle \Phi \colon G\times V\to V\quad {\text{or}}\quad \Phi \colon A\times V\to V}
  

with two properties.

1. For any 
  
    
      
        g
      
    
    {\displaystyle g}
  
 in 
  
    
      
        G
      
    
    {\displaystyle G}
  
 (or 
  
    
      
        a
      
    
    {\displaystyle a}
  
 in 
  
    
      
        A
      
    
    {\displaystyle A}
  
), the map 
  
    
      
        
          
            
              
                Φ
                (
                g
                )
                :
                V
              
              
                
                →
                V
              
            
            
              
                v
              
              
                
                ↦
                Φ
                (
                g
                ,
                v
                )
              
            
          
        
      
    
    {\displaystyle {\begin{aligned}\Phi (g)\colon V&\to V\\v&\mapsto \Phi (g,v)\end{aligned}}}
  

is linear (over 
  
    
      
        
          F
        
      
    
    {\displaystyle \mathbb {F} }
  
).
1. If we introduce the notation g · v for 
  
    
      
        Φ
      
    
    {\displaystyle \Phi }
  
 (g, v), then for any g1, g2 in G and v in V:

  
    
      
        (
        2.1
        )
        
        e
        ⋅
        v
        =
        v
      
    
    {\displaystyle (2.1)\quad e\cdot v=v}
  

  
    
      
        (
        2.2
        )
        
        
          g
          
            1
          
        
        ⋅
        (
        
          g
          
            2
          
        
        ⋅
        v
        )
        =
        (
        
          g
          
            1
          
        
        
          g
          
            2
          
        
        )
        ⋅
        v
      
    
    {\displaystyle (2.2)\quad g_{1}\cdot (g_{2}\cdot v)=(g_{1}g_{2})\cdot v}
  

where e is the identity element of G and g1g2 is the group product in G.
The definition for associative algebras is analogous, except that associative algebras do not always have an identity element, in which case equation (2.1) is omitted. Equation (2.2) is an abstract expression of the associativity of matrix multiplication. This doesn't hold for the matrix commutator and also there is no identity element for the commutator. Hence for Lie algebras, the only requirement is that for any x1, x2 in A and v in V:

  
    
      
        (
        
          2.2
          ′
        
        )
        
        
          x
          
            1
          
        
        ⋅
        (
        
          x
          
            2
          
        
        ⋅
        v
        )
        −
        
          x
          
            2
          
        
        ⋅
        (
        
          x
          
            1
          
        
        ⋅
        v
        )
        =
        [
        
          x
          
            1
          
        
        ,
        
          x
          
            2
          
        
        ]
        ⋅
        v
      
    
    {\displaystyle (2.2')\quad x_{1}\cdot (x_{2}\cdot v)-x_{2}\cdot (x_{1}\cdot v)=[x_{1},x_{2}]\cdot v}
  

where [x1, x2] is the Lie bracket, which generalizes the matrix commutator MN − NM.

#### Mapping

The second way to define a representation focuses on the map φ sending g in G to a linear map φ(g): V → V, which satisfies

and similarly in the other cases. This approach is both more concise and more abstract.
From this point of view:

- a representation of a group G on a vector space V is a group homomorphism φ: G → GL(V,F);[8]
- a representation of an associative algebra A on a vector space V is an algebra homomorphism φ: A → EndF(V);[8]
- a representation of a Lie algebra 
  
    
      
        
          
            a
          
        
      
    
    {\displaystyle {\mathfrak {a}}}
  
 on a vector space 
  
    
      
        V
      
    
    {\displaystyle V}
  
 is a Lie algebra homomorphism 
  
    
      
        ϕ
        :
        
          
            a
          
        
        →
        
          
            g
            l
          
        
        (
        V
        ,
        
          F
        
        )
      
    
    {\displaystyle \phi :{\mathfrak {a}}\to {\mathfrak {gl}}(V,\mathbb {F} )}
  
.

### Terminology

The vector space V is called the representation space of φ and its dimension (if finite) is called the dimension of the representation (sometimes degree, as in [18]). It is also common practice to refer to V itself as the representation when the homomorphism φ is clear from the context; otherwise the notation (V,φ) can be used to denote a representation.

When V is of finite dimension n, one can choose a basis for V to identify V with Fn, and hence recover a matrix representation with entries in the field F.

An effective or faithful representation is a representation (V,φ), for which the homomorphism φ is injective.

### Equivariant maps and isomorphisms

If 
  
    
      
        V
      
    
    {\displaystyle V}
  
 and 
  
    
      
        W
      
    
    {\displaystyle W}
  
 are vector spaces over 
  
    
      
        
          F
        
      
    
    {\displaystyle \mathbb {F} }
  
, equipped with representations 
  
    
      
        φ
      
    
    {\displaystyle \varphi }
  
 and 
  
    
      
        ψ
      
    
    {\displaystyle \psi }
  
 of a group 
  
    
      
        G
      
    
    {\displaystyle G}
  
, then an equivariant map from 
  
    
      
        V
      
    
    {\displaystyle V}
  
 to 
  
    
      
        W
      
    
    {\displaystyle W}
  
 is a linear map 
  
    
      
        α
        :
        V
        →
        W
      
    
    {\displaystyle \alpha :V\rightarrow W}
  
 such that

  
    
      
        α
        (
        g
        ⋅
        v
        )
        =
        g
        ⋅
        α
        (
        v
        )
      
    
    {\displaystyle \alpha (g\cdot v)=g\cdot \alpha (v)}
  

for all 
  
    
      
        g
      
    
    {\displaystyle g}
  
 in 
  
    
      
        G
      
    
    {\displaystyle G}
  
 and 
  
    
      
        v
      
    
    {\displaystyle v}
  
 in 
  
    
      
        V
      
    
    {\displaystyle V}
  
. In terms of 
  
    
      
        φ
        :
        G
        →
        
          GL
        
        (
        V
        )
      
    
    {\displaystyle \varphi :G\rightarrow {\text{GL}}(V)}
  
 and 
  
    
      
        ψ
        :
        G
        →
        
          GL
        
        (
        W
        )
      
    
    {\displaystyle \psi :G\rightarrow {\text{GL}}(W)}
  
, this means

  
    
      
        α
        ∘
        φ
        (
        g
        )
        =
        ψ
        (
        g
        )
        ∘
        α
      
    
    {\displaystyle \alpha \circ \varphi (g)=\psi (g)\circ \alpha }
  

for all 
  
    
      
        g
      
    
    {\displaystyle g}
  
 in 
  
    
      
        G
      
    
    {\displaystyle G}
  
, that is, the following diagram commutes:

Equivariant maps for representations of an associative or Lie algebra are defined similarly. If 
  
    
      
        α
      
    
    {\displaystyle \alpha }
  
 is invertible, then it is said to be an isomorphism, in which case 
  
    
      
        V
      
    
    {\displaystyle V}
  
 and 
  
    
      
        W
      
    
    {\displaystyle W}
  
 (or, more precisely, 
  
    
      
        φ
      
    
    {\displaystyle \varphi }
  
 and 
  
    
      
        ψ
      
    
    {\displaystyle \psi }
  
) are isomorphic representations, also phrased as equivalent representations. An equivariant map is often called an intertwining map of representations. Also, in the case of a group 
  
    
      
        G
      
    
    {\displaystyle G}
  
, it is on occasion called a 
  
    
      
        G
      
    
    {\displaystyle G}
  
-map or 
  
    
      
        G
      
    
    {\displaystyle G}
  
-linear map.[19]

Isomorphic representations are, for practical purposes, "the same"; they provide the same information about the group or algebra being represented. Representation theory therefore seeks to classify representations up to isomorphism.

### Subrepresentations, quotients, and irreducible representations

If 
  
    
      
        (
        V
        ,
        ψ
        )
      
    
    {\displaystyle (V,\psi )}
  
 is a representation of (say) a group 
  
    
      
        G
      
    
    {\displaystyle G}
  
, and 
  
    
      
        W
      
    
    {\displaystyle W}
  
 is a linear subspace of 
  
    
      
        V
      
    
    {\displaystyle V}
  
 that is preserved by the action of 
  
    
      
        G
      
    
    {\displaystyle G}
  
 in the sense that for all 
  
    
      
        w
        ∈
        W
      
    
    {\displaystyle w\in W}
  
 and 
  
    
      
        g
        ∈
        G
      
    
    {\displaystyle g\in G}
  
, 
  
    
      
        g
        ⋅
        w
        ∈
        W
      
    
    {\displaystyle g\cdot w\in W}
  
 (Serre calls these 
  
    
      
        W
      
    
    {\displaystyle W}
  
 stable under 
  
    
      
        G
      
    
    {\displaystyle G}
  
[18]), then 
  
    
      
        W
      
    
    {\displaystyle W}
  
 is called a subrepresentation: by defining 
  
    
      
        ϕ
        :
        G
        →
        
          Aut
        
        (
        W
        )
      
    
    {\displaystyle \phi :G\to {\text{Aut}}(W)}
  
 where 
  
    
      
        ϕ
        (
        g
        )
      
    
    {\displaystyle \phi (g)}
  
 is the restriction of 
  
    
      
        ψ
        (
        g
        )
      
    
    {\displaystyle \psi (g)}
  
 to 
  
    
      
        W
      
    
    {\displaystyle W}
  
, 
  
    
      
        (
        W
        ,
        ϕ
        )
      
    
    {\displaystyle (W,\phi )}
  
 is a representation of 
  
    
      
        G
      
    
    {\displaystyle G}
  
 and the inclusion of 
  
    
      
        W
        ↪
        V
      
    
    {\displaystyle W\hookrightarrow V}
  
 is an equivariant map. The quotient space 
  
    
      
        V
        
          /
        
        W
      
    
    {\displaystyle V/W}
  
 can also be made into a representation of 
  
    
      
        G
      
    
    {\displaystyle G}
  
. If 
  
    
      
        V
      
    
    {\displaystyle V}
  
 has exactly two subrepresentations, namely the trivial subspace {0} and 
  
    
      
        V
      
    
    {\displaystyle V}
  
 itself, then the representation is said to be irreducible; if 
  
    
      
        V
      
    
    {\displaystyle V}
  
 has a proper nontrivial subrepresentation, the representation is said to be reducible.[20]

The definition of an irreducible representation implies Schur's lemma: an equivariant map 
  
    
      
        α
        :
        (
        V
        ,
        ψ
        )
        →
        (
        
          V
          ′
        
        ,
        
          ψ
          ′
        
        )
      
    
    {\displaystyle \alpha :(V,\psi )\to (V',\psi ')}
  
 between irreducible representations is either the zero map or an isomorphism, since its kernel and image are subrepresentations. In particular, when 
  
    
      
        V
        =
        
          V
          ′
        
      
    
    {\displaystyle V=V'}
  
, this shows that the equivariant endomorphisms of 
  
    
      
        V
      
    
    {\displaystyle V}
  
 form an associative division algebra over the underlying field F. If F is algebraically closed, the only equivariant endomorphisms of an irreducible representation are the scalar multiples of the identity.

Irreducible representations are the building blocks of representation theory for many groups: if a representation 
  
    
      
        V
      
    
    {\displaystyle V}
  
 is not irreducible then it is built from a subrepresentation and a quotient that are both "simpler" in some sense; for instance, if 
  
    
      
        V
      
    
    {\displaystyle V}
  
 is finite-dimensional, then both the subrepresentation and the quotient have smaller dimension. There are counterexamples where a representation has a subrepresentation, but only has one non-trivial irreducible component. For example, the additive group 
  
    
      
        (
        
          R
        
        ,
        +
        )
      
    
    {\displaystyle (\mathbb {R} ,+)}
  
 has a two dimensional representation

  
    
      
        ϕ
        (
        a
        )
        =
        
          
            [
            
              
                
                  1
                
                
                  a
                
              
              
                
                  0
                
                
                  1
                
              
            
            ]
          
        
      
    
    {\displaystyle \phi (a)={\begin{bmatrix}1&a\\0&1\end{bmatrix}}}
  

This group has the vector 
  
    
      
        
          
            
              [
              
                
                  
                    1
                  
                  
                    0
                  
                
              
              ]
            
          
          
            
              T
            
          
        
      
    
    {\displaystyle {\begin{bmatrix}1&0\end{bmatrix}}^{\mathsf {T}}}
  
 fixed by this homomorphism, but the complement subspace maps to

  
    
      
        
          
            [
            
              
                
                  0
                
              
              
                
                  1
                
              
            
            ]
          
        
        ↦
        
          
            [
            
              
                
                  a
                
              
              
                
                  1
                
              
            
            ]
          
        
      
    
    {\displaystyle {\begin{bmatrix}0\\1\end{bmatrix}}\mapsto {\begin{bmatrix}a\\1\end{bmatrix}}}
  

giving only one irreducible subrepresentation. This is true for all unipotent groups.[21]: 112

### Direct sums and indecomposable representations

If (V,φ) and (W,ψ) are representations of (say) a group G, then the direct sum of V and W is a representation, in a canonical way, via the equation

The direct sum of two representations carries no more information about the group G than the two representations do individually. If a representation is the direct sum of two proper nontrivial subrepresentations, it is said to be decomposable. Otherwise, it is said to be indecomposable.

### Complete reducibility

In favorable circumstances, every finite-dimensional representation is a direct sum of irreducible representations: such representations are said to be semisimple. In this case, it suffices to understand only the irreducible representations. Examples where this "complete reducibility" phenomenon occurs (at least over fields of characteristic zero) include finite groups (see Maschke's theorem), compact groups, and semisimple Lie algebras.

In cases where complete reducibility does not hold, one must understand how indecomposable representations can be built from irreducible representations by using extensions of quotients by subrepresentations.

### Tensor products of representations

Suppose 
  
    
      
        
          ϕ
          
            1
          
        
        :
        G
        →
        
          G
          L
        
        (
        
          V
          
            1
          
        
        )
      
    
    {\displaystyle \phi _{1}:G\rightarrow \mathrm {GL} (V_{1})}
  
 and 
  
    
      
        
          ϕ
          
            2
          
        
        :
        G
        →
        
          G
          L
        
        (
        
          V
          
            2
          
        
        )
      
    
    {\displaystyle \phi _{2}:G\rightarrow \mathrm {GL} (V_{2})}
  
 are representations of a group 
  
    
      
        G
      
    
    {\displaystyle G}
  
. Then we can form a representation 
  
    
      
        
          ϕ
          
            1
          
        
        ⊗
        
          ϕ
          
            2
          
        
      
    
    {\displaystyle \phi _{1}\otimes \phi _{2}}
  
 of G acting on the tensor product vector space 
  
    
      
        
          V
          
            1
          
        
        ⊗
        
          V
          
            2
          
        
      
    
    {\displaystyle V_{1}\otimes V_{2}}
  
 as follows:[22]

If 
  
    
      
        
          ϕ
          
            1
          
        
      
    
    {\displaystyle \phi _{1}}
  
 and 
  
    
      
        
          ϕ
          
            2
          
        
      
    
    {\displaystyle \phi _{2}}
  
 are representations of a Lie algebra, then the correct formula to use is[23]

This product can be recognized as the coproduct on a coalgebra. In general, the tensor product of irreducible representations is not irreducible; the process of decomposing a tensor product as a direct sum of irreducible representations is known as Clebsch–Gordan theory.

In the case of the representation theory of the group SU(2) (or equivalently, of its complexified Lie algebra 
  
    
      
        
          s
          l
        
        (
        2
        ;
        
          C
        
        )
      
    
    {\displaystyle \mathrm {sl} (2;\mathbb {C} )}
  
), the decomposition is easy to work out.[24] The irreducible representations are labeled by a parameter 
  
    
      
        l
      
    
    {\displaystyle l}
  
 that is a non-negative integer or half integer; the representation then has dimension 
  
    
      
        2
        l
        +
        1
      
    
    {\displaystyle 2l+1}
  
. Suppose we take the tensor product of the representation of two representations, with labels 
  
    
      
        
          l
          
            1
          
        
      
    
    {\displaystyle l_{1}}
  
 and 
  
    
      
        
          l
          
            2
          
        
        ,
      
    
    {\displaystyle l_{2},}
  
 where we assume 
  
    
      
        
          l
          
            1
          
        
        ≥
        
          l
          
            2
          
        
      
    
    {\displaystyle l_{1}\geq l_{2}}
  
. Then the tensor product decomposes as a direct sum of one copy of each representation with label 
  
    
      
        l
      
    
    {\displaystyle l}
  
, where 
  
    
      
        l
      
    
    {\displaystyle l}
  
 ranges from 
  
    
      
        
          l
          
            1
          
        
        −
        
          l
          
            2
          
        
      
    
    {\displaystyle l_{1}-l_{2}}
  
 to 
  
    
      
        
          l
          
            1
          
        
        +
        
          l
          
            2
          
        
      
    
    {\displaystyle l_{1}+l_{2}}
  
 in increments of 1. If, for example, 
  
    
      
        
          l
          
            1
          
        
        =
        
          l
          
            2
          
        
        =
        1
      
    
    {\displaystyle l_{1}=l_{2}=1}
  
, then the values of 
  
    
      
        l
      
    
    {\displaystyle l}
  
 that occur are 0, 1, and 2. Thus, the tensor product representation of dimension 
  
    
      
        (
        2
        
          l
          
            1
          
        
        +
        1
        )
        ×
        (
        2
        
          l
          
            2
          
        
        +
        1
        )
        =
        3
        ×
        3
        =
        9
      
    
    {\displaystyle (2l_{1}+1)\times (2l_{2}+1)=3\times 3=9}
  
 decomposes as a direct sum of a 1-dimensional representation 
  
    
      
        (
        l
        =
        0
        )
        ,
      
    
    {\displaystyle (l=0),}
  
 a 3-dimensional representation 
  
    
      
        (
        l
        =
        1
        )
        ,
      
    
    {\displaystyle (l=1),}
  
 and a 5-dimensional representation 
  
    
      
        (
        l
        =
        2
        )
      
    
    {\displaystyle (l=2)}
  
.

## Branches and topics

Representation theory is notable for the number of branches it has, and the diversity of the approaches to studying representations of groups and algebras. Although, all the theories have in common the basic concepts discussed already, they differ considerably in detail. The differences are at least 3-fold:

1. Representation theory depends upon the type of algebraic object being represented. There are several different classes of groups, associative algebras and Lie algebras, and their representation theories all have an individual flavour.
1. Representation theory depends upon the nature of the vector space on which the algebraic object is represented. The most important distinction is between finite-dimensional representations and infinite-dimensional ones. In the infinite-dimensional case, additional structures are important (for example, whether or not the space is a Hilbert space, Banach space, etc.). Additional algebraic structures can also be imposed in the finite-dimensional case.
1. Representation theory depends upon the type of field over which the vector space is defined. The most important cases are the field of complex numbers, the field of real numbers, finite fields, and fields of p-adic numbers. Additional difficulties arise for fields of positive characteristic and for fields that are not algebraically closed.

### Finite groups

Group representations are a very important tool in the study of finite groups.[25] They also arise in the applications of finite group theory to geometry and crystallography.[26] Representations of finite groups exhibit many of the features of the general theory and point the way to other branches and topics in representation theory.

Over a field of characteristic zero, the representation of a finite group G has a number of convenient properties. First, the representations of G are semisimple (completely reducible). This is a consequence of Maschke's theorem, which states that any subrepresentation V of a G-representation W has a G-invariant complement. One proof is to choose any projection π from W to V and replace it by its average πG defined by

πG is equivariant, and its kernel is the required complement.

The finite-dimensional G-representations can be understood using character theory: the character of a representation φ: G → GL(V) is the class function χφ: G → F defined by

where 
  
    
      
        
          T
          r
        
      
    
    {\displaystyle \mathrm {Tr} }
  
 is the trace. An irreducible representation of G is completely determined by its character.

Maschke's theorem holds more generally for fields of positive characteristic p, such as the finite fields, as long as the prime p is coprime to the order of G. When p and |G| have a common factor, there are G-representations that are not semisimple, which are studied in a subbranch called modular representation theory.

Averaging techniques also show that if F is the real or complex numbers, then any G-representation preserves an inner product 
  
    
      
        ⟨
        ⋅
        ,
        ⋅
        ⟩
      
    
    {\displaystyle \langle \cdot ,\cdot \rangle }
  
 on V in the sense that

for all g in G and v, w in W. Hence any G-representation is unitary.

Unitary representations are automatically semisimple, since Maschke's result can be proven by taking the orthogonal complement of a subrepresentation. When studying representations of groups that are not finite, the unitary representations provide a good generalization of the real and complex representations of a finite group.

Results such as Maschke's theorem and the unitary property that rely on averaging can be generalized to more general groups by replacing the average with an integral, provided that a suitable notion of integral can be defined. This can be done for compact topological groups (including compact Lie groups), using Haar measure, and the resulting theory is known as abstract harmonic analysis.

Over arbitrary fields, another class of finite groups that have a good representation theory are the finite groups of Lie type. Important examples are linear algebraic groups over finite fields. The representation theory of linear algebraic groups and Lie groups extends these examples to infinite-dimensional groups, the latter being intimately related to Lie algebra representations. The importance of character theory for finite groups has an analogue in the theory of weights for representations of Lie groups and Lie algebras.

Representations of a finite group G are also linked directly to algebra representations via the group algebra F[G], which is a vector space over F with the elements of G as a basis, equipped with the multiplication operation defined by the group operation, linearity, and the requirement that the group operation and scalar multiplication commute.

### Modular representations

Modular representations of a finite group G are representations over a field whose characteristic is not coprime to |G|, so that Maschke's theorem no longer holds (because |G| is not invertible in F and so one cannot divide by it).[27] Nevertheless, Richard Brauer extended much of character theory to modular representations, and this theory played an important role in early progress towards the classification of finite simple groups, especially for simple groups whose characterization was not amenable to purely group-theoretic methods because their Sylow 2-subgroups were "too small".[28]

As well as having applications to group theory, modular representations arise naturally in other branches of mathematics, such as algebraic geometry, coding theory, combinatorics and number theory.

### Unitary representations

A unitary representation of a group G is a linear representation φ of G on a real or (usually) complex Hilbert space V such that φ(g) is a unitary operator for every g ∈ G. Such representations have been widely applied in quantum mechanics since the 1920s, thanks in particular to the influence of Hermann Weyl,[29] and this has inspired the development of the theory, most notably through the analysis of representations of the Poincaré group by Eugene Wigner.[30] One of the pioneers in constructing a general theory of unitary representations (for any group G rather than just for particular groups useful in applications) was George Mackey, and an extensive theory was developed by Harish-Chandra and others in the 1950s and 1960s.[31]

A major goal is to describe the "unitary dual", the space of irreducible unitary representations of G.[32] The theory is most well-developed in the case that G is a locally compact (Hausdorff) topological group and the representations are strongly continuous.[11] For G abelian, the unitary dual is just the space of characters, while for G compact, the Peter–Weyl theorem shows that the irreducible unitary representations are finite-dimensional and the unitary dual is discrete.[33] For example, if G is the circle group S1, then the characters are given by integers, and the unitary dual is Z.

For non-compact G, the question of which representations are unitary is a subtle one. Although irreducible unitary representations must be "admissible" (as Harish-Chandra modules) and it is easy to detect which admissible representations have a nondegenerate invariant sesquilinear form, it is hard to determine when this form is positive definite. An effective description of the unitary dual, even for relatively well-behaved groups such as real reductive Lie groups (discussed below), remains an important open problem in representation theory. It has been solved for many particular groups, such as SL(2,R) and the Lorentz group.[34]

### Harmonic analysis

The duality between the circle group S1 and the integers Z, or more generally, between a torus Tn and Zn is well known in analysis as the theory of Fourier series, and the Fourier transform similarly expresses the fact that the space of characters on a real vector space is the dual vector space. Thus unitary representation theory and harmonic analysis are intimately related, and abstract harmonic analysis exploits this relationship, by developing the analysis of functions on locally compact topological groups and related spaces.[11]

A major goal is to provide a general form of the Fourier transform and the Plancherel theorem. This is done by constructing a measure on the unitary dual and an isomorphism between the regular representation of G on the space L2(G) of square integrable functions on G and its representation on the space of L2 functions on the unitary dual. Pontrjagin duality and the Peter–Weyl theorem achieve this for abelian and compact G respectively.[33][35]

Another approach involves considering all unitary representations, not just the irreducible ones. These form a category, and Tannaka–Krein duality provides a way to recover a compact group from its category of unitary representations.

If the group is neither abelian nor compact, no general theory is known with an analogue of the Plancherel theorem or Fourier inversion, although Alexander Grothendieck extended Tannaka–Krein duality to a relationship between linear algebraic groups and tannakian categories.

Harmonic analysis has also been extended from the analysis of functions on a group G to functions on homogeneous spaces for G. The theory is particularly well developed for symmetric spaces and provides a theory of automorphic forms (discussed below).

### Lie groups

A Lie group is a group that is also a smooth manifold. Many classical groups of matrices over the real or complex numbers are Lie groups.[36] Many of the groups important in physics and chemistry are Lie groups, and their representation theory is crucial to the application of group theory in those fields.[9]

The representation theory of Lie groups can be developed first by considering the compact groups, to which results of compact representation theory apply.[32] This theory can be extended to finite-dimensional representations of semisimple Lie groups using Weyl's unitary trick: each semisimple real Lie group G has a complexification, which is a complex Lie group Gc, and this complex Lie group has a maximal compact subgroup K. The finite-dimensional representations of G closely correspond to those of K.

A general Lie group is a semidirect product of a solvable Lie group and a semisimple Lie group (the Levi decomposition).[37] The classification of representations of solvable Lie groups is intractable in general, but often easy in practical cases. Representations of semidirect products can then be analysed by means of general results called Mackey theory, which is a generalization of the methods used in Wigner's classification of representations of the Poincaré group.

### Lie algebras

A Lie algebra over a field F is a vector space over F equipped with a skew-symmetric bilinear operation called the Lie bracket, which satisfies the Jacobi identity. Lie algebras arise in particular as tangent spaces to Lie groups at the identity element, leading to their interpretation as "infinitesimal symmetries".[37] An important approach to the representation theory of Lie groups is to study the corresponding representation theory of Lie algebras, but representations of Lie algebras also have an intrinsic interest.[38]

Lie algebras, like Lie groups, have a Levi decomposition into semisimple and solvable parts, with the representation theory of solvable Lie algebras being intractable in general. In contrast, the finite-dimensional representations of semisimple Lie algebras are completely understood, after work of Élie Cartan. A representation of a semisimple Lie algebra 𝖌 is analysed by choosing a Cartan subalgebra, which is essentially a generic maximal subalgebra 𝖍 of 𝖌 on which the Lie bracket is zero ("abelian"). The representation of 𝖌 can be decomposed into weight spaces that are eigenspaces for the action of 𝖍 and the infinitesimal analogue of characters. The structure of semisimple Lie algebras then reduces the analysis of representations to easily understood combinatorics of the possible weights that can occur.[37]

#### Infinite-dimensional Lie algebras

There are many classes of infinite-dimensional Lie algebras whose representations have been studied. Among these, an important class are the Kac–Moody algebras.[39] They are named after Victor Kac and Robert Moody, who independently discovered them. These algebras form a generalization of finite-dimensional semisimple Lie algebras, and share many of their combinatorial properties. This means that they have a class of representations that can be understood in the same way as representations of semisimple Lie algebras.

Affine Lie algebras are a special case of Kac–Moody algebras, which have particular importance in mathematics and theoretical physics, especially conformal field theory and the theory of exactly solvable models. Kac discovered an elegant proof of certain combinatorial identities, Macdonald identities, which is based on the representation theory of affine Kac–Moody algebras.

#### Lie superalgebras

Lie superalgebras are generalizations of Lie algebras in which the underlying vector space has a Z2-grading, and skew-symmetry and Jacobi identity properties of the Lie bracket are modified by signs. Their representation theory is similar to the representation theory of Lie algebras.[40]

### Linear algebraic groups

Linear algebraic groups (or more generally, affine group schemes) are analogues in algebraic geometry of Lie groups, but over more general fields than just R or C. In particular, over finite fields, they give rise to finite groups of Lie type. Although linear algebraic groups have a classification that is very similar to that of Lie groups, their representation theory is rather different (and much less well understood) and requires different techniques, since the Zariski topology is relatively weak, and techniques from analysis are no longer available.[41]

### Invariant theory

Invariant theory studies actions on algebraic varieties from the point of view of their effect on functions, which form representations of the group. Classically, the theory dealt with the question of explicit description of polynomial functions that do not change, or are invariant, under the transformations from a given linear group. The modern approach analyses the decomposition of these representations into irreducibles.[42]

Invariant theory of infinite groups is inextricably linked with the development of linear algebra, especially, the theories of quadratic forms and determinants. Another subject with strong mutual influence is projective geometry, where invariant theory can be used to organize the subject, and during the 1960s, new life was breathed into the subject by David Mumford in the form of his geometric invariant theory.[43]

The representation theory of semisimple Lie groups has its roots in invariant theory[36] and the strong links between representation theory and algebraic geometry have many parallels in differential geometry, beginning with Felix Klein's Erlangen program and Élie Cartan's connections, which place groups and symmetry at the heart of geometry.[44] Modern developments link representation theory and invariant theory to areas as diverse as holonomy, differential operators and the theory of several complex variables.

### Automorphic forms and number theory

Automorphic forms are a generalization of modular forms to more general analytic functions, perhaps of several complex variables, with similar transformation properties.[45] The generalization involves replacing the modular group PSL2 (R) and a chosen congruence subgroup by a semisimple Lie group G and a discrete subgroup Γ. Just as modular forms can be viewed as differential forms on a quotient of the upper half space H = PSL2 (R)/SO(2), automorphic forms can be viewed as differential forms (or similar objects) on Γ\G/K, where K is (typically) a maximal compact subgroup of G. Some care is required, however, as the quotient typically has singularities. The quotient of a semisimple Lie group by a compact subgroup is a symmetric space and so the theory of automorphic forms is intimately related to harmonic analysis on symmetric spaces.

Before the development of the general theory, many important special cases were worked out in detail, including the Hilbert modular forms and Siegel modular forms. Important results in the theory include the Selberg trace formula and the realization by Robert Langlands that the Riemann–Roch theorem could be applied to calculate the dimension of the space of automorphic forms. The subsequent notion of "automorphic representation" has proved of great technical value for dealing with the case that G is an algebraic group, treated as an adelic algebraic group. As a result, an entire philosophy, the Langlands program has developed around the relation between representation and number theoretic properties of automorphic forms.[46]

### Associative algebras

In one sense, associative algebra representations generalize both representations of groups and Lie algebras. A representation of a group induces a representation of a corresponding group ring or group algebra, while representations of a Lie algebra correspond bijectively to representations of its universal enveloping algebra. However, the representation theory of general associative algebras does not have all of the nice properties of the representation theory of groups and Lie algebras.

#### Module theory

When considering representations of an associative algebra, one can forget the underlying field, and simply regard the associative algebra as a ring, and its representations as modules. This approach is surprisingly fruitful: many results in representation theory can be interpreted as special cases of results about modules over a ring.

#### Hopf algebras and quantum groups

Hopf algebras provide a way to improve the representation theory of associative algebras, while retaining the representation theory of groups and Lie algebras as special cases. In particular, the tensor product of two representations is a representation, as is the dual vector space.

The Hopf algebras associated to groups have a commutative algebra structure, and so general Hopf algebras are known as quantum groups, although this term is often restricted to certain Hopf algebras arising as deformations of groups or their universal enveloping algebras. The representation theory of quantum groups has added surprising insights to the representation theory of Lie groups and Lie algebras, for instance through the crystal basis of Kashiwara.

## History

## Generalizations

### Set-theoretic representations

A set-theoretic representation (also known as a group action or permutation representation) of a group G on a set X is given by a function ρ from G to XX, the set of functions from X to X, such that for all g1, g2 in G and all x in X:

This condition and the axioms for a group imply that ρ(g) is a bijection (or permutation) for all g in G. Thus we may equivalently define a permutation representation to be a group homomorphism from G to the symmetric group SX of X.

### Representations in other categories

Every group G can be viewed as a category with a single object; morphisms in this category are just the elements of G. Given an arbitrary category C, a representation of G in C is a functor from G to C. Such a functor selects an object X in C and a group homomorphism from G to Aut(X), the automorphism group of X.

In the case where C is VectF, the category of vector spaces over a field F, this definition is equivalent to a linear representation. Likewise, a set-theoretic representation is just a representation of G in the category of sets.

For another example consider the category of topological spaces, Top. Representations in Top are homomorphisms from G to the homeomorphism group of a topological space X.

Three types of representations closely related to linear representations are:

- projective representations: in the category of projective spaces. These can be described as "linear representations up to scalar transformations".
- affine representations: in the category of affine spaces. For example, the Euclidean group acts affinely upon Euclidean space.
- corepresentations of unitary and antiunitary groups: in the category of complex vector spaces with morphisms being linear or antilinear transformations.

### Representations of categories

Since groups are categories, one can also consider representation of other categories. The simplest generalization is to monoids, which are categories with one object. Groups are monoids for which every morphism is invertible. General monoids have representations in any category. In the category of sets, these are monoid actions, but monoid representations on vector spaces and other objects can be studied.

More generally, one can relax the assumption that the category being represented has only one object. In full generality, this is simply the theory of functors between categories, and little can be said.

One special case has had a significant impact on representation theory, namely the representation theory of quivers.[15] A quiver is simply a directed graph (with loops and multiple arrows allowed), but it can be made into a category (and also an algebra) by considering paths in the graph. Representations of such categories/algebras have illuminated several aspects of representation theory, for instance by allowing non-semisimple representation theory questions about a group to be reduced in some cases to semisimple representation theory questions about a quiver.

## Asymptotic representation theory

For now, see the following.

- .mw-parser-output cite.citation{font-style:inherit;word-wrap:break-word}.mw-parser-output .citation q{quotes:"\"""\"""'""'"}.mw-parser-output .citation:target{background-color:rgba(0,127,255,0.133)}.mw-parser-output .id-lock-free.id-lock-free a{background:url("//upload.wikimedia.org/wikipedia/commons/6/65/Lock-green.svg")right 0.1em center/9px no-repeat}.mw-parser-output .id-lock-limited.id-lock-limited a,.mw-parser-output .id-lock-registration.id-lock-registration a{background:url("//upload.wikimedia.org/wikipedia/commons/d/d6/Lock-gray-alt-2.svg")right 0.1em center/9px no-repeat}.mw-parser-output .id-lock-subscription.id-lock-subscription a{background:url("//upload.wikimedia.org/wikipedia/commons/a/aa/Lock-red-alt-2.svg")right 0.1em center/9px no-repeat}.mw-parser-output .cs1-ws-icon a{background:url("//upload.wikimedia.org/wikipedia/commons/4/4c/Wikisource-logo.svg")right 0.1em center/12px no-repeat}body:not(.skin-timeless):not(.skin-minerva) .mw-parser-output .id-lock-free a,body:not(.skin-timeless):not(.skin-minerva) .mw-parser-output .id-lock-limited a,body:not(.skin-timeless):not(.skin-minerva) .mw-parser-output .id-lock-registration a,body:not(.skin-timeless):not(.skin-minerva) .mw-parser-output .id-lock-subscription a,body:not(.skin-timeless):not(.skin-minerva) .mw-parser-output .cs1-ws-icon a{background-size:contain;padding:0 1em 0 0}.mw-parser-output .cs1-code{color:inherit;background:inherit;border:none;padding:inherit}.mw-parser-output .cs1-hidden-error{display:none;color:var(--color-error,#bf3c2c)}.mw-parser-output .cs1-visible-error{color:var(--color-error,#bf3c2c)}.mw-parser-output .cs1-maint{display:none;color:#085;margin-left:0.3em}.mw-parser-output .cs1-kern-left{padding-left:0.2em}.mw-parser-output .cs1-kern-right{padding-right:0.2em}.mw-parser-output .citation .mw-selflink{font-weight:inherit}@media screen{.mw-parser-output .cs1-format{font-size:95%}html.skin-theme-clientpref-night .mw-parser-output .cs1-maint{color:#18911f}}@media screen and (prefers-color-scheme:dark){html.skin-theme-clientpref-os .mw-parser-output .cs1-maint{color:#18911f}}Vershik, Anatoly. "Between "very large" and "infinite": the asymptotic representation theory". Probability and Mathematical Statistics. 33 (2): 467–476. Retrieved 21 October 2022.
- Anatoly Vershik, Two lectures on the asymptotic representation theory and statistics of Young diagrams, In: Vershik A.M., Yakubovich Y. (eds) Asymptotic Combinatorics with Applications to Mathematical Physics Lecture Notes in Mathematics, vol 1815. Springer 2003
- G. Olshanski, Asymptotic representation theory, Lecture notes 2009–2010
- https://ncatlab.org/nlab/show/asymptotic+representation+theory

## See also

- Galois representation
- Glossary of representation theory
- Group representation
- Itô's theorem
- List of representation theory topics
- List of harmonic analysis topics
- Numerical analysis
- Philosophy of cusp forms
- Representation (mathematics)
- Representation theorem
- Universal algebra

## Notes

## References

- Alperin, J. L. (1986), Local Representation Theory: Modular Representations as an Introduction to the Local Representation Theory of Finite Groups, Cambridge University Press, ISBN 978-0-521-44926-7.
- Bargmann, V. (1947), "Irreducible unitary representations of the Lorenz group", Annals of Mathematics, 48 (3): 568–640, doi:10.2307/1969129, JSTOR 1969129.
- Borel, Armand (2001), Essays in the History of Lie Groups and Algebraic Groups, American Mathematical Society, ISBN 978-0-8218-0288-5.
- Borel, Armand; Casselman, W. (1979), Automorphic Forms, Representations, and L-functions, American Mathematical Society, ISBN 978-0-8218-1435-2.
- Curtis, Charles W.; Reiner, Irving (1962), Representation Theory of Finite Groups and Associative Algebras, John Wiley & Sons (Reedition 2006 by AMS Bookstore), ISBN 978-0-470-18975-7 {{citation}}: ISBN / Date incompatibility (help).
- Folland, Gerald B. (1995), A Course in Abstract Harmonic Analysis, CRC Press, ISBN 978-0-8493-8490-5.
- Fulton, William; Harris, Joe (1991). Representation theory. A first course. Graduate Texts in Mathematics, Readings in Mathematics. Vol. 129. New York: Springer-Verlag. doi:10.1007/978-1-4612-0979-9. ISBN 978-0-387-97495-8. MR 1153249. OCLC 246650103..
- Gelbart, Stephen (1984), "An Elementary Introduction to the Langlands Program", Bulletin of the American Mathematical Society, 10 (2): 177–219, doi:10.1090/S0273-0979-1984-15237-6.
- Goodman, Roe; Wallach, Nolan R. (1998), Representations and Invariants of the Classical Groups, Cambridge University Press, ISBN 978-0-521-66348-9.
- Hall, Brian C. (2015), Lie Groups, Lie Algebras, and Representations: An Elementary Introduction, Graduate Texts in Mathematics, vol. 222 (2nd ed.), Springer, ISBN 978-3319134666
- Helgason, Sigurdur (1978), Differential Geometry, Lie groups and Symmetric Spaces, Academic Press, ISBN 978-0-12-338460-7
- Humphreys, James E. (1972a), Introduction to Lie Algebras and Representation Theory, Birkhäuser, ISBN 978-0-387-90053-7.
- Humphreys, James E. (1972b), Linear Algebraic Groups, Graduate Texts in Mathematics, vol. 21, Berlin, New York: Springer-Verlag, ISBN 978-0-387-90108-4, MR 0396773
- James, Gordon; Liebeck, Martin (1993), Representations and Characters of Groups, Cambridge: Cambridge University Press, ISBN 978-0-521-44590-0.
- Jantzen, Jens Carsten (2003), Representations of Algebraic Groups, American Mathematical Society, ISBN 978-0-8218-3527-2.
- Kac, Victor G. (1977), "Lie superalgebras", Advances in Mathematics, 26 (1): 8–96, doi:10.1016/0001-8708(77)90017-2.
- Kac, Victor G. (1990), Infinite Dimensional Lie Algebras (3rd ed.), Cambridge University Press, ISBN 978-0-521-46693-6.
- Kim, Shoon Kyung (1999), Group Theoretical Methods and Applications to Molecules and Crystals: And Applications to Molecules and Crystals, Cambridge University Press, ISBN 978-0-521-64062-6.
- Knapp, Anthony W. (2001), Representation Theory of Semisimple Groups: An Overview Based on Examples, Princeton University Press, ISBN 978-0-691-09089-4.
- Kostrikin, A. I.; Manin, Yuri I. (1997), Linear Algebra and Geometry, Taylor & Francis, ISBN 978-90-5699-049-7.
- Lam, T. Y. (1998), "Representations of finite groups: a hundred years", Notices of the AMS, 45 (3, 4): 361–372 (Part I), 465–474 (Part II).
- Lyubich, Yurii I. (1988). Introduction to the Theory of Banach Representations of Groups. Operator Theory: Advances and Applications. Vol. 30. Basel: Birkhauser. ISBN 978-3-7643-2207-6.
- Mumford, David; Fogarty, J.; Kirwan, F. (1994), Geometric invariant theory, Ergebnisse der Mathematik und ihrer Grenzgebiete (2) [Results in Mathematics and Related Areas (2)], vol. 34 (3rd ed.), Berlin, New York: Springer-Verlag, ISBN 978-3-540-56963-3, MR 0214602; MR 0719371 (2nd ed.); MR 1304906(3rd ed.)
- Olver, Peter J. (1999), Classical invariant theory, Cambridge: Cambridge University Press, ISBN 978-0-521-55821-1.
- Peter, F.; Weyl, Hermann (1927), "Die Vollständigkeit der primitiven Darstellungen einer geschlossenen kontinuierlichen Gruppe", Mathematische Annalen, 97 (1): 737–755, doi:10.1007/BF01447892, S2CID 120013521.
- Pontrjagin, Lev S. (1934), "The theory of topological commutative groups", Annals of Mathematics, 35 (2): 361–388, doi:10.2307/1968438, JSTOR 1968438.
- Sally, Paul; Vogan, David A. (1989), Representation Theory and Harmonic Analysis on Semisimple Lie Groups, American Mathematical Society, ISBN 978-0-8218-1526-7.
- Serre, Jean-Pierre (1977), Linear Representations of Finite Groups, Springer-Verlag, ISBN 978-0387901909.
- Sharpe, Richard W. (1997), Differential Geometry: Cartan's Generalization of Klein's Erlangen Program, Springer, ISBN 978-0-387-94732-7.
- Simson, Daniel; Skowronski, Andrzej; Assem, Ibrahim (2007), Elements of the Representation Theory of Associative Algebras, Cambridge University Press, ISBN 978-0-521-88218-7.
- Sternberg, Shlomo (1994), Group Theory and Physics, Cambridge University Press, ISBN 978-0-521-55885-3.
- Tung, Wu-Ki (1985). Group Theory in Physics (1st ed.). New Jersey·London·Singapore·Hong Kong: World Scientific. ISBN 978-9971966577.
- Weyl, Hermann (1928), Gruppentheorie und Quantenmechanik (The Theory of Groups and Quantum Mechanics, translated H.P. Robertson, 1931 ed.), S. Hirzel, Leipzig (reprinted 1950, Dover), ISBN 978-0-486-60269-1 {{citation}}: ISBN / Date incompatibility (help).
- Weyl, Hermann (1946), The Classical Groups: Their Invariants and Representations (2nd ed.), Princeton University Press (reprinted 1997), ISBN 978-0-691-05756-9 {{citation}}: ISBN / Date incompatibility (help).
- Wigner, Eugene P. (1939), "On unitary representations of the inhomogeneous Lorentz group", Annals of Mathematics, 40 (1): 149–204, Bibcode:1939AnMat..40..149W, doi:10.2307/1968551, JSTOR 1968551, S2CID 121773411.

## External links

- "Representation theory", Encyclopedia of Mathematics, EMS Press, 2001 [1994]
- Alexander Kirillov Jr., An introduction to Lie groups and Lie algebras (2008).  Textbook, preliminary version pdf downloadable from author's home page.
- Kevin Hartnett, (2020), article on representation theory in Quanta magazine
- Grabowski, Jan (2025). Representation Theory: A Categorical Approach. Open Book Publishers. ISBN 978-1-80511-716-2.