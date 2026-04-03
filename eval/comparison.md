# Translation Evaluation: Representation Theory

- **URL**: https://en.wikipedia.org/wiki/Representation_theory
- **Model**: google/gemini-3-flash-preview
- **Style**: auto (fluent expository prose)
- **Register**: dearu
- **Elapsed**: 37689ms
- **API Requests**: 21
- **Tokens**: prompt=22830, completion=15049

---

## Section 1

### Original (English)

Representation theory is a branch of mathematics that studies abstract algebraic structures by representing their elements as linear transformations of vector spaces, and studies modules over these abstract algebraic structures.[1][2] In essence, a representation makes an abstract algebraic object more concrete by describing its elements by matrices and their algebraic operations (for example, matrix addition, matrix multiplication).

The algebraic objects amenable to such a description include groups, associative algebras and Lie algebras. The most prominent of these (and historically the first) is the representation theory of groups, in which elements of a group are represented by invertible matrices such that the group operation is matrix multiplication.[3][4]

Representation theory is a useful method because it reduces problems in abstract algebra to problems in linear algebra, a subject that is well understood.[5][6] Representations of more abstract objects in terms of familiar linear algebra can elucidate properties and simplify calculations within more abstract theories. For instance, representing a group by an infinite-dimensional Hilbert space allows methods of analysis to be applied to the theory of groups.[7][8] Furthermore, representation theory is important in physics because it can describe how the symmetry group of a physical system affects the solutions of equations describing that system.[9]

Representation theory is pervasive across fields of mathematics. The applications of representation theory are diverse.[10] In addition to its impact on algebra, representation theory

- generalizes Fourier analysis via harmonic analysis,[11]
- is connected to geometry via invariant theory and the Erlangen program,[12]
- has an impact in number theory via automorphic forms and the Langlands program.[13]
There are many approaches to representation theory: the same objects can be studied using methods from algebraic geometry, module theory, analytic number theory, differential geometry, operator theory, algebraic combinatorics and topology.[14]

The success of representation theory has led to numerous generalizations. One of the most general is in category theory.[15] The algebraic objects to which representation theory applies can be viewed as particular kinds of categories, and the representations as functors from the object category to the category of vector spaces.[4] This description points to two natural generalizations: first, the algebraic objects can be replaced by more general categories; second, the target category of vector spaces can be replaced by other well-understood categories.

### Translation (Japanese)

表現論は、数学の一分野であり、抽象的な代数的構造の元をベクトル空間の線形変換として表現することでそれらを研究し、またそれらの抽象的代数構造上の加群を研究する。[1][2] 本質的に、表現とは、抽象的な代数的対象の元を行列とその代数演算（例えば行列の加法、行列の乗法）によって記述することで、その対象をより具体化するものである。

このような記述が可能な代数的対象には、群、結合代数、リー代数などがある。これらの中で最も顕著な（そして歴史的に最初に現れた）ものは群の表現論であり、そこでは群の元が、群の演算が行列の乗法となるように可逆行列によって表現される。[3][4]

表現論は、抽象代数学における問題を、よく理解されている線形代数学の問題に帰着させるため、有用な手法である。[5][6] より抽象的な対象を馴染み深い線形代数の言葉で表現することは、より抽象的な理論における性質を解明し、計算を簡略化することにつながる。例えば、群を無限次元のヒルベルト空間で表現することで、解析学の手法を群論に適用することが可能となる。[7][8] さらに、表現論は物理学においても重要である。なぜなら、物理系の対称性群がその系を記述する方程式の解にどのような影響を与えるかを記述できるからである。[9]

表現論は数学のあらゆる分野に浸透している。表現論の応用は多岐にわたる。[10] 代数学への影響に加え、表現論は

- 調和解析を通じてフーリエ解析を一般化し、[11]
- 不変式論やエルランゲン・プログラムを通じて幾何学と結びつき、[12]
- 保型形式やラングランズ・プログラムを通じて数論に影響を与えている。[13]
表現論へのアプローチは多岐にわたる。同じ対象であっても、代数幾何学、加群論、解析的数論、微分幾何学、作用素論、代数的組合せ論、そしてトポロジーの手法を用いて研究することができる。[14]

表現論の成功は数多くの一般化をもたらした。その最も一般的なものの一つが圏論におけるものである。[15] 表現論が適用される代数的対象は特定の種類の圏とみなすことができ、表現はその対象の圏からベクトル空間の圏への関手とみなすことができる。[4] この記述は2つの自然な一般化を示唆している。第一に、代数的対象をより一般的な圏に置き換えること、第二に、ターゲットとなるベクトル空間の圏を他のよく理解された圏に置き換えることである。

---

## Section 2

### Original (English)

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

### Translation (Japanese)

## 定義と概念

V
      
    
    {\displaystyle V}
  
を
  
    
      
        
          F
        
      
    
    {\displaystyle \mathbb {F} }
  
上の ベクトル空間とする。[6] 例えば、
  
    
      
        V
      
    
    {\displaystyle V}
  
が
  
    
      
        
          
            R
          
          
            n
          
        
      
    
    {\displaystyle \mathbb {R} ^{n}}
  
または
  
    
      
        
          
            C
          
          
            n
          
        
      
    
    {\displaystyle \mathbb {C} ^{n}}
  
、すなわち数または数上の 列ベクトルからなる標準的な n 次元空間である場合を考える。それぞれの場合において、表現論の考え方は、
  
    
      
        n
        ×
        n
      
    
    {\displaystyle n\times n}
  
の数または数からなる 行列を用いることで、抽象代数学を具体的に実行することにある。

これを行うことができる代数的対象には、群、結合代数、リー代数という3つの主要な種類がある。[16][4]

- すべての可逆
  
    
      
        n
        ×
        n
      
    
    {\displaystyle n\times n}
  
行列の集合は、行列の積に関して群をなし、群の表現論は群の元を可逆行列として記述（表現）することで、その群を解析する。
- 行列の加法と乗法は、すべての
  
    
      
        n
        ×
        n
      
    
    {\displaystyle n\times n}
  
行列の集合を結合代数にするため、それに対応する結合代数の表現論が存在する。
- 行列の乗法
  
    
      
        M
        N
      
    
    {\displaystyle MN}
  
を行列の交換子に置き換えると
  
    
      
        M
        N
        −
        N
        M
      
    
    {\displaystyle MN-NM}
  
、その結果
  
    
      
        n
        ×
        n
      
    
    {\displaystyle n\times n}
  
行列は代わりにリー代数となり、リー代数の表現論へとつながる。
これは任意の体
  
    
      
        
          F
        
      
    
    {\displaystyle \mathbb {F} }
  
および
  
    
      
        
          F
        
      
    
    {\displaystyle \mathbb {F} }
  
上の任意のベクトル空間
  
    
      
        V
      
    
    {\displaystyle V}
  
に一般化される。その際、行列は線形写像に置き換わり、行列の積は合成に置き換わる。すなわち、
  
    
      
        V
      
    
    {\displaystyle V}
  
の自己同型からなる群
  
    
      
        
          GL
        
        (
        V
        ,
        
          F
        
        )
      
    
    {\displaystyle {\text{GL}}(V,\mathbb {F} )}
  
、
  
    
      
        V
      
    
    {\displaystyle V}
  
のすべての自己準同型からなる結合代数
  
    
      
        
          
            End
          
          
            
              F
            
          
        
        (
        V
        )
      
    
    {\displaystyle {\text{End}}_{\mathbb {F} }(V)}
  
、そしてそれに対応するリー代数
  
    
      
        
          
            g
            l
          
        
        (
        V
        ,
        
          F
        
        )
      
    
    {\displaystyle {\mathfrak {gl}}(V,\mathbb {F} )}
  
が存在する。

---

## Section 3

### Original (English)

### Definition

### Translation (Japanese)

### 定義

---

## Section 4

### Original (English)

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

### Translation (Japanese)

#### 作用

表現を定義する方法は2つある。[17] 1つ目は作用の概念を用いるもので、行列が行列の積によって列ベクトルに作用する様式を一般化したものである。

群の表現とは
  
    
      
        G
      
    
    {\displaystyle G}
  
あるいは（結合代数またはリー）代数の
  
    
      
        A
      
    
    {\displaystyle A}
  
、ベクトル空間上の
  
    
      
        V
      
    
    {\displaystyle V}
  
、写像である
  
    
      
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
  
、二つの性質を持つ。

1. G
      
    
    {\displaystyle G}
  
（または
  
    
      
        A
      
    
    {\displaystyle A}
  
）の任意の
  
    
      
        g
      
    
    {\displaystyle g}
  
（または
  
    
      
        a
      
    
    {\displaystyle a}
  
）に対して、写像
  
    
      
        
          
            
              
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
  
は（
  
    
      
        
          F
        
      
    
    {\displaystyle \mathbb {F} }
  
上）線形である。
1. Φ
      
    
    {\displaystyle \Phi }
  
(g,v) に対してg·vという記法を導入すれば、Gの任意のg1,g2およびVの任意のvに対して、
  
    
      
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
  
が成り立つ。ここでeはGの単位元であり、g1g2はGにおける群演算である。
結合代数の定義も同様であるが、結合代数は必ずしも単位元を持つとは限らず、その場合は式(2.1)は省略される。式(2.2)は行列の積の結合法則を抽象的に表現したものである。これは行列の交換子には成り立たず、また交換子には単位元も存在しない。したがってリー代数の場合、唯一の要件は、A内の任意のx1、x2およびV内のvに対して、
  
    
      
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
  
が成り立つことである。ここでx1、x2]はリー括弧であり、これは行列の交換子MN−NMを一般化したものである。

---

## Section 5

### Original (English)

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

### Translation (Japanese)

#### 写像

表現を定義する第二の方法は、Gの元gを線形写像φ(g): V → Vへ送る写像φに焦点を当てるものであり、これは次を満たす。

他の場合も同様である。このアプローチはより簡潔かつ抽象的である。この観点から見ると、

- ベクトル空間 V 上の群 G の表現とは、群準同型 φ: G → GL(V,F) である。[8]
- ベクトル空間 V 上の結合代数 A の表現とは、代数準同型 φ: A → EndF(V) である。[8]
- ベクトル空間上のリー代数
  
    
      
        
          
            a
          
        
      
    
    {\displaystyle {\mathfrak {a}}}
  
の表現とは、
  
    
      
        V
      
    
    {\displaystyle V}
  
はリー代数準同型である。
  
    
      
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
  
。

---

## Section 6

### Original (English)

### Terminology

The vector space V is called the representation space of φ and its dimension (if finite) is called the dimension of the representation (sometimes degree, as in [18]). It is also common practice to refer to V itself as the representation when the homomorphism φ is clear from the context; otherwise the notation (V,φ) can be used to denote a representation.

When V is of finite dimension n, one can choose a basis for V to identify V with Fn, and hence recover a matrix representation with entries in the field F.

An effective or faithful representation is a representation (V,φ), for which the homomorphism φ is injective.

### Translation (Japanese)

### 用語

ベクトル空間 V は φ の表現空間と呼ばれ、その次元（有限の場合）は表現の次元（[18]にあるように、時に次数とも呼ばれる）と呼ばれる。準同型 φ が文脈から明らかな場合は、V 自体を表現と呼ぶことも一般的である。そうでない場合は、記法 (V,φ) を用いて表現を表すことができる。

V が有限次元 n である場合、V の基底を選択することで V を Fn と同一視でき、したがって体 F の成分を持つ行列表現を得ることができる。

有効な表現または忠実な表現とは、準同型 φ が単射であるような表現 (V,φ) のことである。

---

## Section 7

### Original (English)

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

### Translation (Japanese)

### 同変写像と同型

V
      
    
    {\displaystyle V}
  
および
  
    
      
        W
      
    
    {\displaystyle W}
  
を
  
    
      
        
          F
        
      
    
    {\displaystyle \mathbb {F} }
  
上のベクトル空間とし、それぞれ群
  
    
      
        G
      
    
    {\displaystyle G}
  
の表現
  
    
      
        φ
      
    
    {\displaystyle \varphi }
  
および
  
    
      
        ψ
      
    
    {\displaystyle \psi }
  
を備えているとする。このとき、
  
    
      
        V
      
    
    {\displaystyle V}
  
から
  
    
      
        W
      
    
    {\displaystyle W}
  
への同変写像とは、以下の条件を満たす線形写像
  
    
      
        α
        :
        V
        →
        W
      
    
    {\displaystyle \alpha :V\rightarrow W}
  
である。
  
    
      
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
  
これはすべての
  
    
      
        g
      
    
    {\displaystyle g}
  
∈
  
    
      
        G
      
    
    {\displaystyle G}
  
および
  
    
      
        v
      
    
    {\displaystyle v}
  
∈
  
    
      
        V
      
    
    {\displaystyle V}
  
に対して成り立つ。
  
    
      
        φ
        :
        G
        →
        
          GL
        
        (
        V
        )
      
    
    {\displaystyle \varphi :G\rightarrow {\text{GL}}(V)}
  
および
  
    
      
        ψ
        :
        G
        →
        
          GL
        
        (
        W
        )
      
    
    {\displaystyle \psi :G\rightarrow {\text{GL}}(W)}
  
を用いて表すと、これは 
  
    
      
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
  
がすべての
  
    
      
        g
      
    
    {\displaystyle g}
  
∈
  
    
      
        G
      
    
    {\displaystyle G}
  
に対して成り立つことを意味する。すなわち、以下の 可換図式が成り立つ。

結合代数またはリー代数の表現に対する同変写像も同様に定義される。
  
    
      
        α
      
    
    {\displaystyle \alpha }
  
が可逆である場合、それは 同型写像と呼ばれ、そのとき
  
    
      
        V
      
    
    {\displaystyle V}
  
と
  
    
      
        W
      
    
    {\displaystyle W}
  
（より正確には
  
    
      
        φ
      
    
    {\displaystyle \varphi }
  
と
  
    
      
        ψ
      
    
    {\displaystyle \psi }
  
）は同型な表現であると言い、等価な表現とも呼ばれる。同変写像は、表現の絡み合い写像（intertwining map）と呼ばれることも多い。また、群
  
    
      
        G
      
    
    {\displaystyle G}
  
の場合には、
  
    
      
        G
      
    
    {\displaystyle G}
  
-写像や
  
    
      
        G
      
    
    {\displaystyle G}
  
-線形写像と呼ばれることもある。[19]

同型な表現は、実用上は「同一」である。それらは表現される群や代数について同一の情報を提供する。したがって、表現論は同型を除いて表現を分類することを目指す。

---

## Section 8

### Original (English)

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

### Translation (Japanese)

### 部分表現、商、および既約表現

(
        V
        ,
        ψ
        )
      
    
    {\displaystyle (V,\psi )}
  
を（例えば）群
  
    
      
        G
      
    
    {\displaystyle G}
  
の表現とし、
  
    
      
        W
      
    
    {\displaystyle W}
  
を 
  
    
      
        V
      
    
    {\displaystyle V}
  
の線形部分空間であって、すべての
  
    
      
        w
        ∈
        W
      
    
    {\displaystyle w\in W}
  
および
  
    
      
        g
        ∈
        G
      
    
    {\displaystyle g\in G}
  
に対して
  
    
      
        g
        ⋅
        w
        ∈
        W
      
    
    {\displaystyle g\cdot w\in W}
  
となるような（セールはこれらを 
  
    
      
        W
      
    
    {\displaystyle W}
  
が
  
    
      
        G
      
    
    {\displaystyle G}
  
の下で安定であると呼んでいる[18]）
  
    
      
        G
      
    
    {\displaystyle G}
  
の作用によって不変であるものとすると、
  
    
      
        W
      
    
    {\displaystyle W}
  
は部分表現と呼ばれる。：
  
    
      
        ϕ
        :
        G
        →
        
          Aut
        
        (
        W
        )
      
    
    {\displaystyle \phi :G\to {\text{Aut}}(W)}
  
を定義することにより、ここで
  
    
      
        ϕ
        (
        g
        )
      
    
    {\displaystyle \phi (g)}
  
は 
  
    
      
        ψ
        (
        g
        )
      
    
    {\displaystyle \psi (g)}
  
の
  
    
      
        W
      
    
    {\displaystyle W}
  
への制限であり、
  
    
      
        (
        W
        ,
        ϕ
        )
      
    
    {\displaystyle (W,\phi )}
  
は 
  
    
      
        G
      
    
    {\displaystyle G}
  
の表現となり、
  
    
      
        W
        ↪
        V
      
    
    {\displaystyle W\hookrightarrow V}
  
の包含写像は同変写像となる。商空間
  
    
      
        V
        
          /
        
        W
      
    
    {\displaystyle V/W}
  
もまた
  
    
      
        G
      
    
    {\displaystyle G}
  
の表現にすることができる。
  
    
      
        V
      
    
    {\displaystyle V}
  
がちょうど2つの部分表現、すなわち 自明な部分空間 {0} と
  
    
      
        V
      
    
    {\displaystyle V}
  
自身のみを持つ場合、その表現は既約であると言われる。[20]

既約表現の定義はシューアの補題を意味する。すなわち、既約表現間の同変写像
  
    
      
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
  
は、その核がおよび像が部分表現であるため、零写像であるか、あるいは同型写像である。特に 
  
    
      
        V
        =
        
          V
          ′
        
      
    
    {\displaystyle V=V'}
  
の場合、これは 
  
    
      
        V
      
    
    {\displaystyle V}
  
の同変自己準同型が、基礎体F上の結合的可除代数をなすことを示している。もしFが代数閉体であれば、既約表現の同変自己準同型は恒等写像のスカラー倍のみである。

既約表現は、多くの群の表現論における構成要素である。表現
  
    
      
        V
      
    
    {\displaystyle V}
  
が既約でない場合、それはある意味でより「単純な」部分表現と商表現から構成される。例えば、
  
    
      
        V
      
    
    {\displaystyle V}
  
が有限次元であれば、部分表現と商表現はいずれもより小さい次元を持つ。表現が部分表現を持ちながら、非自明な既約成分を一つしか持たない反例も存在する。例えば、加法群
  
    
      
        (
        
          R
        
        ,
        +
        )
      
    
    {\displaystyle (\mathbb {R} ,+)}
  
は2次元表現
  
    
      
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
  
を持つ。この群には、この準同型によって固定されるベクトル
  
    
      
        
          
            
              [
              
                
                  
                    1
                  
                  
                    0
                  
                
              
              ]
            
          
          
            
              T
            
          
        
      
    
    {\displaystyle {\begin{bmatrix}1&0\end{bmatrix}}^{\mathsf {T}}}
  
が存在するが、補空間は 
  
    
      
        
          
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
  
に写像され、既約部分表現は一つしか得られない。これはすべての冪単群について成り立つ。[21]: 112

---

## Section 9

### Original (English)

### Direct sums and indecomposable representations

If (V,φ) and (W,ψ) are representations of (say) a group G, then the direct sum of V and W is a representation, in a canonical way, via the equation

The direct sum of two representations carries no more information about the group G than the two representations do individually. If a representation is the direct sum of two proper nontrivial subrepresentations, it is said to be decomposable. Otherwise, it is said to be indecomposable.

### Translation (Japanese)

### 直和と既約分解不可能な表現

(V,φ) および (W,ψ) を（例えば）群 G の表現とするとき、V と W の直和は、以下の式を通じて標準的な方法で表現となる。

2つの表現の直和は、群 G に関して、個々の表現が持つ以上の情報を付加するものではない。ある表現が2つの真の非自明な部分表現の直和である場合、それは可約であると言われる。そうでない場合は、既約であると言われる。

---

## Section 10

### Original (English)

### Complete reducibility

In favorable circumstances, every finite-dimensional representation is a direct sum of irreducible representations: such representations are said to be semisimple. In this case, it suffices to understand only the irreducible representations. Examples where this "complete reducibility" phenomenon occurs (at least over fields of characteristic zero) include finite groups (see Maschke's theorem), compact groups, and semisimple Lie algebras.

In cases where complete reducibility does not hold, one must understand how indecomposable representations can be built from irreducible representations by using extensions of quotients by subrepresentations.

### Translation (Japanese)

### 完全可約性

好都合な状況下では、すべての有限次元表現は既約表現の直和となる。このような表現は半単純であると言われる。この場合、既約表現のみを理解すれば十分である。この「完全可約性」という現象が生じる例（少なくとも標数0の体上）には、有限群（マシュケの定理を参照）、コンパクト群、半単純リー代数などがある。

完全可約性が成り立たない場合には、部分表現による商の拡大を用いて、既約表現からどのようにして非既約表現が構成されるかを理解しなければならない。

---

## Section 11

### Original (English)

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

### Translation (Japanese)

### 表現のテンソル積

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
  
と
  
    
      
        
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
  
を群
  
    
      
        G
      
    
    {\displaystyle G}
  
の表現とする。このとき、テンソル積ベクトル空間
  
    
      
        
          V
          
            1
          
        
        ⊗
        
          V
          
            2
          
        
      
    
    {\displaystyle V_{1}\otimes V_{2}}
  
に作用する G の表現
  
    
      
        
          ϕ
          
            1
          
        
        ⊗
        
          ϕ
          
            2
          
        
      
    
    {\displaystyle \phi _{1}\otimes \phi _{2}}
  
を次のように構成できる。[22]

ϕ
          
            1
          
        
      
    
    {\displaystyle \phi _{1}}
  
と
  
    
      
        
          ϕ
          
            2
          
        
      
    
    {\displaystyle \phi _{2}}
  
がリー環の表現である場合、用いるべき正しい公式は以下の通りである。[23]

この積は余代数上の余積として認識できる。一般に、既約表現のテンソル積は必ずしも既約ではない。テンソル積を既約表現の直和に分解する過程は、クレブシュ・ゴルダン理論として知られている。

SU(2) 群の表現論（あるいは同等に、その複素化リー環
  
    
      
        
          s
          l
        
        (
        2
        ;
        
          C
        
        )
      
    
    {\displaystyle \mathrm {sl} (2;\mathbb {C} )}
  
の表現論）の場合、その分解は容易に導出できる。[24]既約表現は、非負の整数または半整数であるパラメータ
  
    
      
        l
      
    
    {\displaystyle l}
  
によってラベル付けされ、その表現の次元は
  
    
      
        2
        l
        +
        1
      
    
    {\displaystyle 2l+1}
  
となる。ラベル
  
    
      
        
          l
          
            1
          
        
      
    
    {\displaystyle l_{1}}
  
および
  
    
      
        
          l
          
            2
          
        
        ,
      
    
    {\displaystyle l_{2},}
  
を持つ2つの表現のテンソル積をとるものとし、
  
    
      
        
          l
          
            1
          
        
        ≥
        
          l
          
            2
          
        
      
    
    {\displaystyle l_{1}\geq l_{2}}
  
と仮定する。このとき、テンソル積はラベル
  
    
      
        l
      
    
    {\displaystyle l}
  
を持つ各表現の直和に分解され、ここで
  
    
      
        l
      
    
    {\displaystyle l}
  
は
  
    
      
        
          l
          
            1
          
        
        −
        
          l
          
            2
          
        
      
    
    {\displaystyle l_{1}-l_{2}}
  
から
  
    
      
        
          l
          
            1
          
        
        +
        
          l
          
            2
          
        
      
    
    {\displaystyle l_{1}+l_{2}}
  
まで1刻みで変化する。例えば
  
    
      
        
          l
          
            1
          
        
        =
        
          l
          
            2
          
        
        =
        1
      
    
    {\displaystyle l_{1}=l_{2}=1}
  
の場合、現れる
  
    
      
        l
      
    
    {\displaystyle l}
  
の値は 0, 1, 2 である。したがって、次元
  
    
      
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
  
のテンソル積表現は、1次元表現
  
    
      
        (
        l
        =
        0
        )
        ,
      
    
    {\displaystyle (l=0),}
  
、3次元表現
  
    
      
        (
        l
        =
        1
        )
        ,
      
    
    {\displaystyle (l=1),}
  
、および5次元表現
  
    
      
        (
        l
        =
        2
        )
      
    
    {\displaystyle (l=2)}
  
の直和に分解される。

---

## Section 12

### Original (English)

## Branches and topics

Representation theory is notable for the number of branches it has, and the diversity of the approaches to studying representations of groups and algebras. Although, all the theories have in common the basic concepts discussed already, they differ considerably in detail. The differences are at least 3-fold:

1. Representation theory depends upon the type of algebraic object being represented. There are several different classes of groups, associative algebras and Lie algebras, and their representation theories all have an individual flavour.
1. Representation theory depends upon the nature of the vector space on which the algebraic object is represented. The most important distinction is between finite-dimensional representations and infinite-dimensional ones. In the infinite-dimensional case, additional structures are important (for example, whether or not the space is a Hilbert space, Banach space, etc.). Additional algebraic structures can also be imposed in the finite-dimensional case.
1. Representation theory depends upon the type of field over which the vector space is defined. The most important cases are the field of complex numbers, the field of real numbers, finite fields, and fields of p-adic numbers. Additional difficulties arise for fields of positive characteristic and for fields that are not algebraically closed.

### Translation (Japanese)

## 分野とトピック

表現論は、その分野の多さと、群や代数の表現を研究する手法の多様性において顕著である。すべての理論はすでに論じた基本概念を共有しているものの、細部においては大きく異なる。その違いは少なくとも以下の3点に集約される。

1. 表現論は、表現される代数的対象の種類に依存する。群、結合代数、リー代数にはそれぞれ異なるクラスが存在し、それらの表現論はどれも独自の特色を備えている。
1. 表現論は、代数的対象が表現されるベクトル空間の性質に依存する。最も重要な区別は、有限次元表現と無限次元表現の間にある。無限次元の場合には、（例えば、その空間がヒルベルト空間かバナッハ空間かといった）追加の構造が重要となる。有限次元の場合にも、追加の代数的構造を課すことができる。
1. 表現論は、ベクトル空間が定義される体の種類に依存する。最も重要なのは、複素数体、実数体、有限体、およびp進数体である。正標数の体や、代数閉体ではない体については、さらなる困難が生じる。

---

## Section 13

### Original (English)

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

### Translation (Japanese)

### 有限群

群の表現は、有限群の研究における非常に重要なツールである。[25] それらはまた、有限群論を幾何学や結晶学に応用する際にも現れる。[26]有限群の表現は、一般理論の多くの特徴を示しており、表現論の他の分野やトピックへの道筋を示している。

標数0の体上では、有限群 G の表現は多くの便利な性質を持つ。第一に、G の表現は半単純（完全可約）である。これはマシュケの定理の帰結であり、この定理は G-表現 W の任意の部分表現 V は G-不変な補空間を持つと述べている。その証明の一つは、W から V への任意の射影 π を選び、それを以下の式で定義される平均 πG に置き換えることである。

πG は同変であり、その核は求める補空間となる。

有限次元 G-表現は指標理論を用いて理解できる。表現 φ: G → GL(V) の指標とは、以下の式で定義される類関数 χφ: G → F である。

ここで
  
    
      
        
          T
          r
        
      
    
    {\displaystyle \mathrm {Tr} }
  
はトレースである。Gの既約表現はその指標によって完全に決定される。

マシュケの定理は、素数 p が G の位数と互いに素である限り、有限体のような正標数 p の体に対してもより一般的に成立する。p と |G| が共通因子を持つ場合、G-表現には...半単純ではない表現。これはモジュラー表現論と呼ばれる分野で研究されている。

平均化の手法を用いると、Fが実数体または複素数体である場合、任意のG-表現はV上の内積
  
    
      
        ⟨
        ⋅
        ,
        ⋅
        ⟩
      
    
    {\displaystyle \langle \cdot ,\cdot \rangle }
  
を保存することが示される。その意味は以下の通りである。

すべての g ∈ G および v, w ∈ W に対して成り立つ。したがって、任意の G 表現はユニタリ表現となる。

ユニタリ表現は自動的に半単純となる。なぜなら、マシュケの定理の結果は、部分表現の直交補空間をとることで証明できるからである。有限群ではない群の表現を研究する際、ユニタリ表現は有限群の実表現や複素表現の優れた一般化を提供する。

平均化に依存するマシュケの定理やユニタリ性といった結果は、適切な積分の概念を定義できれば、積分で平均を置き換えることにより、より一般的な群へと一般化できる。コンパクト位相群（コンパクトリー群を含む）に対してはハール測度を用いることでこれが可能であり、その結果得られる理論は抽象調和解析として知られている。

任意の体上において、優れた表現論を持つ別の有限群のクラスとしてリー型の有限群がある。重要な例として、有限体上の線形代数群が挙げられる。線形代数群やリー群の表現論は、これらの例を無限次元群へと拡張するものであり、後者は以下と密接に関連している。リー環の表現。有限群における指標理論の重要性は、リー群やリー環の表現におけるウェイトの理論に類似物を持つ。

有限群 G の表現は、群環 F[G] を介して代数の表現と直接結びついている。これは F 上のベクトル空間であり、G の元を基底とし、群演算、線形性、および群演算とスカラー乗法が可換であるという要件によって定義される乗法演算を備えている。

---

## Section 14

### Original (English)

### Modular representations

Modular representations of a finite group G are representations over a field whose characteristic is not coprime to |G|, so that Maschke's theorem no longer holds (because |G| is not invertible in F and so one cannot divide by it).[27] Nevertheless, Richard Brauer extended much of character theory to modular representations, and this theory played an important role in early progress towards the classification of finite simple groups, especially for simple groups whose characterization was not amenable to purely group-theoretic methods because their Sylow 2-subgroups were "too small".[28]

As well as having applications to group theory, modular representations arise naturally in other branches of mathematics, such as algebraic geometry, coding theory, combinatorics and number theory.

### Translation (Japanese)

### モジュラー表現

有限群 G のモジュラー表現とは、標数が |G| と互いに素ではない体上の表現であり、マシュケの定理がもはや成立しない（|G| が F において可逆ではなく、したがってそれで割ることができないため）ものである。[27] それにもかかわらず、リチャード・ブラウアーは指標理論の多くをモジュラー表現へと拡張し、この理論は初期の段階において以下の研究に重要な役割を果たした。有限単純群の分類。特に、そのシロー2部分群が「小さすぎる」ために純粋な群論的手法では特徴付けが困難であった単純群において顕著である。[28]

モジュラー表現は群論への応用に留まらず、数学の他の分野、例えば代数幾何学、符号理論、組合せ論、数論などにおいても自然に現れる。

---

## Section 15

### Original (English)

### Unitary representations

A unitary representation of a group G is a linear representation φ of G on a real or (usually) complex Hilbert space V such that φ(g) is a unitary operator for every g ∈ G. Such representations have been widely applied in quantum mechanics since the 1920s, thanks in particular to the influence of Hermann Weyl,[29] and this has inspired the development of the theory, most notably through the analysis of representations of the Poincaré group by Eugene Wigner.[30] One of the pioneers in constructing a general theory of unitary representations (for any group G rather than just for particular groups useful in applications) was George Mackey, and an extensive theory was developed by Harish-Chandra and others in the 1950s and 1960s.[31]

A major goal is to describe the "unitary dual", the space of irreducible unitary representations of G.[32] The theory is most well-developed in the case that G is a locally compact (Hausdorff) topological group and the representations are strongly continuous.[11] For G abelian, the unitary dual is just the space of characters, while for G compact, the Peter–Weyl theorem shows that the irreducible unitary representations are finite-dimensional and the unitary dual is discrete.[33] For example, if G is the circle group S1, then the characters are given by integers, and the unitary dual is Z.

For non-compact G, the question of which representations are unitary is a subtle one. Although irreducible unitary representations must be "admissible" (as Harish-Chandra modules) and it is easy to detect which admissible representations have a nondegenerate invariant sesquilinear form, it is hard to determine when this form is positive definite. An effective description of the unitary dual, even for relatively well-behaved groups such as real reductive Lie groups (discussed below), remains an important open problem in representation theory. It has been solved for many particular groups, such as SL(2,R) and the Lorentz group.[34]

### Translation (Japanese)

### ユニタリ表現

群 G のユニタリ表現とは、実または（通常は）複素ヒルベルト空間 V 上の G の線形表現 φ であって、すべての g ∈ G に対して φ(g) がユニタリ演算子となるものである。このような表現は、特にヘルマン・ワイルの影響により、1920年代以降量子力学において広く応用されてきた。[29] そしてこれが理論の発展を促し、特にユージン・ウィグナーによるポアンカレ群の表現の解析を通じて顕著な進展が見られた。[30]（応用上便利な特定の群だけでなく、任意の群 G に対する）ユニタリ表現の一般理論を構築する先駆者の一人はジョージ・マッキーであり、1950年代から1960年代にかけてハリシュ＝チャンドラらによって広範な理論が発展した。

主要な目標は、G の既約ユニタリ表現の空間である「ユニタリ双対」を記述することである。[32] この理論は、G が局所コンパクトな（ハウスドルフ）位相群であり、表現が以下のような場合に最もよく発展している。強連続である場合である。[11] G が可換群の場合、ユニタリ双対は単なる指標の空間となる。一方、G がコンパクトな場合、ピーター・ワイルの定理により、既約ユニタリ表現は有限次元であり、ユニタリ双対は離散的であることが示される。[33] 例えば、G が円周群 S1 である場合、指標は整数によって与えられ、ユニタリ双対は Z となる。

非コンパクトな群 G に対して、どの表現がユニタリ表現であるかという問題は微妙なものである。既約ユニタリ表現は「許容的」（ハリシュ・チャンドラ加群として）でなければならず、どの許容的表現が非退化な不変半双線形形式を持つかを判定することは容易であるが、この形式が正定値となる条件を決定することは困難である。実簡約リー群（後述）のような比較的扱いやすい群に対してさえ、ユニタリ双対の有効な記述は、表現論における重要な未解決問題のままである。これは、SL(2,R)やローレンツ群など、多くの特定の群については解決されている。[34]

---

## Section 16

### Original (English)

### Harmonic analysis

The duality between the circle group S1 and the integers Z, or more generally, between a torus Tn and Zn is well known in analysis as the theory of Fourier series, and the Fourier transform similarly expresses the fact that the space of characters on a real vector space is the dual vector space. Thus unitary representation theory and harmonic analysis are intimately related, and abstract harmonic analysis exploits this relationship, by developing the analysis of functions on locally compact topological groups and related spaces.[11]

A major goal is to provide a general form of the Fourier transform and the Plancherel theorem. This is done by constructing a measure on the unitary dual and an isomorphism between the regular representation of G on the space L2(G) of square integrable functions on G and its representation on the space of L2 functions on the unitary dual. Pontrjagin duality and the Peter–Weyl theorem achieve this for abelian and compact G respectively.[33][35]

Another approach involves considering all unitary representations, not just the irreducible ones. These form a category, and Tannaka–Krein duality provides a way to recover a compact group from its category of unitary representations.

If the group is neither abelian nor compact, no general theory is known with an analogue of the Plancherel theorem or Fourier inversion, although Alexander Grothendieck extended Tannaka–Krein duality to a relationship between linear algebraic groups and tannakian categories.

Harmonic analysis has also been extended from the analysis of functions on a group G to functions on homogeneous spaces for G. The theory is particularly well developed for symmetric spaces and provides a theory of automorphic forms (discussed below).

### Translation (Japanese)

### 調和解析

円周群 S1 と整数 Z の間の双対性、あるいはより一般にトーラス Tn と Zn の間の双対性は、解析学においてフーリエ級数の理論としてよく知られている。同様に、フーリエ変換は、実ベクトル空間上の指標の空間が双対ベクトル空間であるという事実を表現している。したがって、ユニタリ表現論と調和解析は密接に関連しており、抽象調和解析はこの関係を利用して、局所コンパクト位相群および関連する空間上の関数の解析を展開する。[11]

主要な目標は、フーリエ変換とプランシュレル定理の一般形式を提供することである。これは、ユニタリ双対上の測度と、G 上の二乗可積分関数の空間 L2(G) における G の正則表現と、ユニタリ双対上の L2 関数空間におけるその表現との間の同型を構成することによって行われる。ポントリャーギン双対およびピーター・ワイルの定理は、それぞれ可換群およびコンパクト群 G に対してこれを達成する。[33][35]

別のアプローチとして、既約表現だけでなく、すべてのユニタリ表現を考慮する方法がある。これらは圏を形成し、田中・クレイン双対は、コンパクト群をそのユニタリ表現の圏から復元する方法を提供する。

群が可換でもコンパクトでもない場合、プランシュレル定理やフーリエ反転公式の類似物を持つ一般理論は知られていない。ただし、アレクサンドル・グロタンディークは、田中・クレイン双対を線形代数群とタナカ圏の間の関係へと拡張した。

調和解析は、群 G 上の関数の解析から、G の等質空間上の関数の解析へと拡張されてきた。この理論は対称空間に対して特に発展しており、保型形式（後述）の理論を提供している。

---

## Section 17

### Original (English)

### Lie groups

A Lie group is a group that is also a smooth manifold. Many classical groups of matrices over the real or complex numbers are Lie groups.[36] Many of the groups important in physics and chemistry are Lie groups, and their representation theory is crucial to the application of group theory in those fields.[9]

The representation theory of Lie groups can be developed first by considering the compact groups, to which results of compact representation theory apply.[32] This theory can be extended to finite-dimensional representations of semisimple Lie groups using Weyl's unitary trick: each semisimple real Lie group G has a complexification, which is a complex Lie group Gc, and this complex Lie group has a maximal compact subgroup K. The finite-dimensional representations of G closely correspond to those of K.

A general Lie group is a semidirect product of a solvable Lie group and a semisimple Lie group (the Levi decomposition).[37] The classification of representations of solvable Lie groups is intractable in general, but often easy in practical cases. Representations of semidirect products can then be analysed by means of general results called Mackey theory, which is a generalization of the methods used in Wigner's classification of representations of the Poincaré group.

### Translation (Japanese)

### リー群

リー群とは、滑らかな多様体でもある群のことである。実数体または複素数体上の多くの古典的な行列群はリー群である。[36] 物理学や化学において重要な群の多くはリー群であり、その表現論はそれらの分野における群論の応用に不可欠である。[9]

リー群の表現論は、まずコンパクト群を考慮することで展開できる。これにはコンパクト群の表現論の結果が適用される。[32] この理論は、ワイルのユニタリトリックを用いて半単純リー群の有限次元表現へと拡張できる。各半単純実リー群 G は、複素化を持ち、それは複素リー群 Gc である。この複素リー群は極大コンパクト部分群 K を持つ。G の有限次元表現は K の表現と密接に対応する。

一般的なリー群は、可解リー群と半単純リー群の半直積である（レヴィ分解）。[37]可解リー群の表現の分類は一般には困難であるが、実際的な場合には容易であることも多い。半直積の表現は、マッキー理論（Mackey theory）と呼ばれる一般的な結果を用いて解析できる。これは、ポアンカレ群の表現に関するウィグナーの分類で用いられた手法を一般化したものである。

---

## Section 18

### Original (English)

### Lie algebras

A Lie algebra over a field F is a vector space over F equipped with a skew-symmetric bilinear operation called the Lie bracket, which satisfies the Jacobi identity. Lie algebras arise in particular as tangent spaces to Lie groups at the identity element, leading to their interpretation as "infinitesimal symmetries".[37] An important approach to the representation theory of Lie groups is to study the corresponding representation theory of Lie algebras, but representations of Lie algebras also have an intrinsic interest.[38]

Lie algebras, like Lie groups, have a Levi decomposition into semisimple and solvable parts, with the representation theory of solvable Lie algebras being intractable in general. In contrast, the finite-dimensional representations of semisimple Lie algebras are completely understood, after work of Élie Cartan. A representation of a semisimple Lie algebra 𝖌 is analysed by choosing a Cartan subalgebra, which is essentially a generic maximal subalgebra 𝖍 of 𝖌 on which the Lie bracket is zero ("abelian"). The representation of 𝖌 can be decomposed into weight spaces that are eigenspaces for the action of 𝖍 and the infinitesimal analogue of characters. The structure of semisimple Lie algebras then reduces the analysis of representations to easily understood combinatorics of the possible weights that can occur.[37]

### Translation (Japanese)

### リー代数

体 F 上のリー環（Lie algebra）とは、リー括弧積と呼ばれる歪対称な双線型演算を備え、ヤコビ恒等式を満たす F 上のベクトル空間である。リー環は、特に次のような対象の接空間として現れる。リー群の単位元における接空間であり、「無限小対称性」として解釈される。[37] リー群の表現論への重要なアプローチとして、対応するリー環の表現論を研究することが挙げられるが、リー環の表現自体も本質的な関心を集めている。[38]

リー環もリー群と同様に、半単純部分と可解部分へのレヴィ分解を持つが、可解リー環の表現論は一般には困難である。対照的に、半単純リー環の有限次元表現は、エリー・カルタンの研究を経て完全に解明されている。半単純リー環 𝖌 の表現は、カルタン部分環を選択することで解析される。これは本質的に、リー括弧積がゼロ（「可換」）となる 𝖌 の一般的な極大部分環 𝖍 である。𝖌 の表現は、𝖍 の作用に対する固有空間であり、指標の無限小的な類似物であるウェイト空間へと分解できる。半単純リー環の構造により、表現の解析は、発生しうるウェイトの組み合わせ論という理解しやすい問題へと帰着される。[37]

---

## Section 19

### Original (English)

#### Infinite-dimensional Lie algebras

There are many classes of infinite-dimensional Lie algebras whose representations have been studied. Among these, an important class are the Kac–Moody algebras.[39] They are named after Victor Kac and Robert Moody, who independently discovered them. These algebras form a generalization of finite-dimensional semisimple Lie algebras, and share many of their combinatorial properties. This means that they have a class of representations that can be understood in the same way as representations of semisimple Lie algebras.

Affine Lie algebras are a special case of Kac–Moody algebras, which have particular importance in mathematics and theoretical physics, especially conformal field theory and the theory of exactly solvable models. Kac discovered an elegant proof of certain combinatorial identities, Macdonald identities, which is based on the representation theory of affine Kac–Moody algebras.

### Translation (Japanese)

#### 無限次元リー代数

表現が研究されている無限次元リー環には多くのクラスが存在する。その中でも重要なクラスがカッツ・ムーディ代数である。[39] これらは、独立に発見したヴィクトル・カッツとロバート・ムーディの名にちなんでいる。これらの代数は、有限次元の半単純リー環の一般化を形成する。ものであり、その組み合わせ論的性質の多くを共有している。これは、半単純リー環の表現と同様の方法で理解できる表現のクラスを持つことを意味する。

アフィン・リー環はカッツ・ムーディ代数の特殊なケースであり、数学および理論物理学、特に共形場理論や可解格子模型の理論において重要な意味を持つ。カッツは、マクドナルド恒等式という特定の組み合わせ論的恒等式の洗練された証明を発見した。これはアフィン・カッツ・ムーディ代数の表現論に基づいている。

---

## Section 20

### Original (English)

#### Lie superalgebras

Lie superalgebras are generalizations of Lie algebras in which the underlying vector space has a Z2-grading, and skew-symmetry and Jacobi identity properties of the Lie bracket are modified by signs. Their representation theory is similar to the representation theory of Lie algebras.[40]

### Translation (Japanese)

#### リー超代数

リー超代数（Lie superalgebra）は、基礎となるベクトル空間が Z2 次数付きであり、リー括弧積の歪対称性とヤコビ恒等式の性質が符号によって修正された、リー環の一般化である。その表現論はリー環の表現論と類似している。[40]

---

## Section 21

### Original (English)

### Linear algebraic groups

Linear algebraic groups (or more generally, affine group schemes) are analogues in algebraic geometry of Lie groups, but over more general fields than just R or C. In particular, over finite fields, they give rise to finite groups of Lie type. Although linear algebraic groups have a classification that is very similar to that of Lie groups, their representation theory is rather different (and much less well understood) and requires different techniques, since the Zariski topology is relatively weak, and techniques from analysis are no longer available.[41]

### Translation (Japanese)

### 線形代数群

線型代数群（あるいはより一般にアフィン群スキーム）は、代数幾何学におけるリー群の類似物であるが、R や C だけでなく、より一般的な体上で定義される。特に有限体上では、これらはリー型の有限群を生み出す。線型代数群の分類はリー群のそれと非常に似ているが、その表現論はかなり異なり（また理解も進んでいない）、異なる手法を必要とする。なぜなら、ザリスキー位相は比較的弱く、解析学の手法がもはや利用できないからである。[41]

---

## Section 22

### Original (English)

### Invariant theory

Invariant theory studies actions on algebraic varieties from the point of view of their effect on functions, which form representations of the group. Classically, the theory dealt with the question of explicit description of polynomial functions that do not change, or are invariant, under the transformations from a given linear group. The modern approach analyses the decomposition of these representations into irreducibles.[42]

Invariant theory of infinite groups is inextricably linked with the development of linear algebra, especially, the theories of quadratic forms and determinants. Another subject with strong mutual influence is projective geometry, where invariant theory can be used to organize the subject, and during the 1960s, new life was breathed into the subject by David Mumford in the form of his geometric invariant theory.[43]

The representation theory of semisimple Lie groups has its roots in invariant theory[36] and the strong links between representation theory and algebraic geometry have many parallels in differential geometry, beginning with Felix Klein's Erlangen program and Élie Cartan's connections, which place groups and symmetry at the heart of geometry.[44] Modern developments link representation theory and invariant theory to areas as diverse as holonomy, differential operators and the theory of several complex variables.

### Translation (Japanese)

### 不変式論

不変式論は、群の表現を形成する関数への影響という観点から、代数多様体への作用を研究する。古典的には、この理論は、与えられた線型群の変換の下で変化しない、あるいは「不変」である多項式関数を明示的に記述するという問題を扱っていた。現代的なアプローチでは、これらの表現の既約表現への分解を解析する。[42]

無限群の不変式論は、線型代数、特に二次形式や行列式の理論の発展と密接に結びついている。相互に強い影響を及ぼし合うもう一つの主題は射影幾何学であり、そこでは不変式論を用いて主題を整理することができる。1960年代には、この分野に新たな息吹が吹き込まれた。デヴィッド・マンフォードによる幾何学的不変式論の形式である。[43]

半単純リー群の表現論は不変式論にその起源を持ち[36]、表現論と代数幾何学の間の強い結びつきは、フェリックス・クラインのエルランゲン・プログラムを端緒として、微分幾何学においても多くの類似点を見出せる。エリー・カルタンの接続は、群と対称性を幾何学の中心に据えるものである。[44] 現代の発展において、表現論と不変式論は、ホロノミー、微分作用素、そして多変数複素関数論といった多様な分野と結びついている。

---

## Section 23

### Original (English)

### Automorphic forms and number theory

Automorphic forms are a generalization of modular forms to more general analytic functions, perhaps of several complex variables, with similar transformation properties.[45] The generalization involves replacing the modular group PSL2 (R) and a chosen congruence subgroup by a semisimple Lie group G and a discrete subgroup Γ. Just as modular forms can be viewed as differential forms on a quotient of the upper half space H = PSL2 (R)/SO(2), automorphic forms can be viewed as differential forms (or similar objects) on Γ\G/K, where K is (typically) a maximal compact subgroup of G. Some care is required, however, as the quotient typically has singularities. The quotient of a semisimple Lie group by a compact subgroup is a symmetric space and so the theory of automorphic forms is intimately related to harmonic analysis on symmetric spaces.

Before the development of the general theory, many important special cases were worked out in detail, including the Hilbert modular forms and Siegel modular forms. Important results in the theory include the Selberg trace formula and the realization by Robert Langlands that the Riemann–Roch theorem could be applied to calculate the dimension of the space of automorphic forms. The subsequent notion of "automorphic representation" has proved of great technical value for dealing with the case that G is an algebraic group, treated as an adelic algebraic group. As a result, an entire philosophy, the Langlands program has developed around the relation between representation and number theoretic properties of automorphic forms.[46]

### Translation (Japanese)

### 保型形式と数論

保型形式は、モジュラー形式を、同様の変換特性を持つより一般的な解析関数（おそらく多変数複素関数）へと一般化したものである。[45] この一般化では、モジュラー群 PSL2 (R)および選択された合同部分群を、半単純リー群 G と離散部分群Γに置き換える。モジュラー形式が上半平面 H = PSL2 (R)/SO(2) の商空間上の微分形式と見なせるのと同様に、保型形式はΓ\G/K 上の微分形式（あるいはそれに類する対象）と見なすことができる。ここで K は（典型的には）G の極大コンパクト部分群である。ただし、この商空間は通常特異点を持つため、注意が必要である。半単純リー群をコンパクト部分群で割った商空間は対称空間であり、したがって保型形式の理論は対称空間上の調和解析と密接に関連している。

一般理論の発展以前には、ヒルベルト・モジュラー形式やジーゲル・モジュラー形式を含む多くの重要な特殊ケースが詳細に研究されていた。この理論における重要な成果には、セルバーグ跡公式や、リーマン・ロッホの定理が保型形式の空間の次元を計算するために適用できるというロバート・ラングランズによる洞察がある。その後の「保型表現」という概念は、G が代数群である場合をアデール的代数群として扱う上で、極めて高い技術的価値があることが証明された。その結果、保型形式の表現論的性質と数論的性質の間の関係を巡って、ラングランズ・プログラムという一つの哲学体系が発展した。[46]

---

## Section 24

### Original (English)

### Associative algebras

In one sense, associative algebra representations generalize both representations of groups and Lie algebras. A representation of a group induces a representation of a corresponding group ring or group algebra, while representations of a Lie algebra correspond bijectively to representations of its universal enveloping algebra. However, the representation theory of general associative algebras does not have all of the nice properties of the representation theory of groups and Lie algebras.

### Translation (Japanese)

### 結合代数

ある意味で、結合代数の表現は、群の表現とリー環の表現の両方を一般化するものである。群の表現は対応する群環または群代数の表現を誘導し、一方、リー環の表現は、その普遍包絡環の表現と一対一に対応する。しかし、一般的な結合代数の表現論は、群やリー環の表現論が持つような優れた性質をすべて備えているわけではない。

---

## Section 25

### Original (English)

#### Module theory

When considering representations of an associative algebra, one can forget the underlying field, and simply regard the associative algebra as a ring, and its representations as modules. This approach is surprisingly fruitful: many results in representation theory can be interpreted as special cases of results about modules over a ring.

### Translation (Japanese)

#### 加群論

結合代数の表現を考える際、基礎となる体を忘れて、単にその結合代数を環とみなし、その表現を加群とみなすことができる。このアプローチは驚くほど実り多いものであり、表現論における多くの結果は、環上の加群に関する結果の特殊なケースとして解釈可能である。

---

## Section 26

### Original (English)

#### Hopf algebras and quantum groups

Hopf algebras provide a way to improve the representation theory of associative algebras, while retaining the representation theory of groups and Lie algebras as special cases. In particular, the tensor product of two representations is a representation, as is the dual vector space.

The Hopf algebras associated to groups have a commutative algebra structure, and so general Hopf algebras are known as quantum groups, although this term is often restricted to certain Hopf algebras arising as deformations of groups or their universal enveloping algebras. The representation theory of quantum groups has added surprising insights to the representation theory of Lie groups and Lie algebras, for instance through the crystal basis of Kashiwara.

### Translation (Japanese)

#### ホップ代数と量子群

ホップ代数は、群やリー環の表現論を特殊なケースとして保持しつつ、結合代数の表現論を改善する手段を提供する。特に、2つの表現のテンソル積や双対ベクトル空間もまた表現となる。

群に関連するホップ代数は可換代数の構造を持つため、一般的なホップ代数は量子群として知られている。ただし、この用語は、群やその普遍包絡環の変形として生じる特定のホップ代数に限定して使われることが多い。量子群の表現論は、例えば柏原の結晶基底などを通じて、リー群やリー環の表現論に驚くべき洞察をもたらした。

---

## Section 27

### Original (English)

## History

### Translation (Japanese)

## 歴史

---

## Section 28

### Original (English)

## Generalizations

### Translation (Japanese)

## 一般化

---

## Section 29

### Original (English)

### Set-theoretic representations

A set-theoretic representation (also known as a group action or permutation representation) of a group G on a set X is given by a function ρ from G to XX, the set of functions from X to X, such that for all g1, g2 in G and all x in X:

This condition and the axioms for a group imply that ρ(g) is a bijection (or permutation) for all g in G. Thus we may equivalently define a permutation representation to be a group homomorphism from G to the symmetric group SX of X.

### Translation (Japanese)

### 集合論的表現

群 G の集合 X 上の集合論的表現（群作用または置換表現とも呼ばれる）は、G から XX（すなわちX から X への関数の集合）への関数 ρ によって与えられ、G の任意の g1, g2 および X の任意の x に対して次が成り立つ。

この条件と群の公理により、すべての G の元 g に対して ρ(g) が全単射（あるいは置換）であることが導かれる。したがって、置換表現とは G から X の対称群 SX への群準同型であると定義しても同値である。

---

## Section 30

### Original (English)

### Representations in other categories

Every group G can be viewed as a category with a single object; morphisms in this category are just the elements of G. Given an arbitrary category C, a representation of G in C is a functor from G to C. Such a functor selects an object X in C and a group homomorphism from G to Aut(X), the automorphism group of X.

In the case where C is VectF, the category of vector spaces over a field F, this definition is equivalent to a linear representation. Likewise, a set-theoretic representation is just a representation of G in the category of sets.

For another example consider the category of topological spaces, Top. Representations in Top are homomorphisms from G to the homeomorphism group of a topological space X.

Three types of representations closely related to linear representations are:

- projective representations: in the category of projective spaces. These can be described as "linear representations up to scalar transformations".
- affine representations: in the category of affine spaces. For example, the Euclidean group acts affinely upon Euclidean space.
- corepresentations of unitary and antiunitary groups: in the category of complex vector spaces with morphisms being linear or antilinear transformations.

### Translation (Japanese)

### 他の圏における表現

すべての群 G は、ただ一つの対象を持つ圏とみなすことができる。この圏における射は、単に G の元である。任意の圏 C が与えられたとき、G の C における「表現」とは、G から C への関手のことである。このような関手は、C 内の対象 X と、G から X の自己同型群 Aut(X) への群準同型を選択する。

C が体 F 上のベクトル空間の圏 VectF である場合、この定義は線形表現と同値である。同様に、集合論的表現とは、単に集合の圏における G の表現のことである。

別の例として、位相空間の圏 Top を考える。Top における表現とは、G から位相空間 X の同相写像群への準同型である。

線形表現と密接に関連する3つの表現型は以下の通りである。

- 射影表現：射影空間の圏におけるもの。これらは「スカラー変換を除いて線形な表現」として記述できる。
- アフィン表現：アフィン空間の圏におけるもの。例えば、ユークリッド群はユークリッド空間にアフィン的に作用する。
- ユニタリ群および反ユニタリ群の余表現：射が線形または反線形変換である複素ベクトル空間の圏におけるもの。

---

## Section 31

### Original (English)

### Representations of categories

Since groups are categories, one can also consider representation of other categories. The simplest generalization is to monoids, which are categories with one object. Groups are monoids for which every morphism is invertible. General monoids have representations in any category. In the category of sets, these are monoid actions, but monoid representations on vector spaces and other objects can be studied.

More generally, one can relax the assumption that the category being represented has only one object. In full generality, this is simply the theory of functors between categories, and little can be said.

One special case has had a significant impact on representation theory, namely the representation theory of quivers.[15] A quiver is simply a directed graph (with loops and multiple arrows allowed), but it can be made into a category (and also an algebra) by considering paths in the graph. Representations of such categories/algebras have illuminated several aspects of representation theory, for instance by allowing non-semisimple representation theory questions about a group to be reduced in some cases to semisimple representation theory questions about a quiver.

### Translation (Japanese)

### 圏の表現

群は圏であるため、他の圏の表現を考えることもできる。最も単純な一般化は、対象を一つ持つ圏であるモノイドへの拡張である。群は、すべての射が可逆であるモノイドである。一般的なモノイドは任意の圏において表現を持つ。集合の圏においては、これらはモノイド作用となるが、ベクトル空間やその他の対象に対するモノイド表現も研究可能である。

より一般的には、表現される圏が対象を一つしか持たないという仮定を緩めることができる。完全に一般化すれば、これは単なる圏の間の関手の理論であり、特筆すべきことはほとんどない。

表現論に多大な影響を与えた特殊なケースとして、箙（quiver）の表現論がある[15]。箙とは単なる有向グラフのことである。（ループや多重辺も許容される）が、グラフ内のパスを考えることで圏（および代数）にすることができる。このような圏や代数の表現は、表現論のいくつかの側面を明らかにしてきた。例えば、群に関する非半単純表現論の問題を、場合によっては箙に関する半単純表現論の問題に帰着させることが可能となる。

---

## Section 32

### Original (English)

## Asymptotic representation theory

For now, see the following.

- .mw-parser-output cite.citation{font-style:inherit;word-wrap:break-word}.mw-parser-output .citation q{quotes:"\"""\"""'""'"}.mw-parser-output .citation:target{background-color:rgba(0,127,255,0.133)}.mw-parser-output .id-lock-free.id-lock-free a{background:url("//upload.wikimedia.org/wikipedia/commons/6/65/Lock-green.svg")right 0.1em center/9px no-repeat}.mw-parser-output .id-lock-limited.id-lock-limited a,.mw-parser-output .id-lock-registration.id-lock-registration a{background:url("//upload.wikimedia.org/wikipedia/commons/d/d6/Lock-gray-alt-2.svg")right 0.1em center/9px no-repeat}.mw-parser-output .id-lock-subscription.id-lock-subscription a{background:url("//upload.wikimedia.org/wikipedia/commons/a/aa/Lock-red-alt-2.svg")right 0.1em center/9px no-repeat}.mw-parser-output .cs1-ws-icon a{background:url("//upload.wikimedia.org/wikipedia/commons/4/4c/Wikisource-logo.svg")right 0.1em center/12px no-repeat}body:not(.skin-timeless):not(.skin-minerva) .mw-parser-output .id-lock-free a,body:not(.skin-timeless):not(.skin-minerva) .mw-parser-output .id-lock-limited a,body:not(.skin-timeless):not(.skin-minerva) .mw-parser-output .id-lock-registration a,body:not(.skin-timeless):not(.skin-minerva) .mw-parser-output .id-lock-subscription a,body:not(.skin-timeless):not(.skin-minerva) .mw-parser-output .cs1-ws-icon a{background-size:contain;padding:0 1em 0 0}.mw-parser-output .cs1-code{color:inherit;background:inherit;border:none;padding:inherit}.mw-parser-output .cs1-hidden-error{display:none;color:var(--color-error,#bf3c2c)}.mw-parser-output .cs1-visible-error{color:var(--color-error,#bf3c2c)}.mw-parser-output .cs1-maint{display:none;color:#085;margin-left:0.3em}.mw-parser-output .cs1-kern-left{padding-left:0.2em}.mw-parser-output .cs1-kern-right{padding-right:0.2em}.mw-parser-output .citation .mw-selflink{font-weight:inherit}@media screen{.mw-parser-output .cs1-format{font-size:95%}html.skin-theme-clientpref-night .mw-parser-output .cs1-maint{color:#18911f}}@media screen and (prefers-color-scheme:dark){html.skin-theme-clientpref-os .mw-parser-output .cs1-maint{color:#18911f}}Vershik, Anatoly. "Between "very large" and "infinite": the asymptotic representation theory". Probability and Mathematical Statistics. 33 (2): 467–476. Retrieved 21 October 2022.
- Anatoly Vershik, Two lectures on the asymptotic representation theory and statistics of Young diagrams, In: Vershik A.M., Yakubovich Y. (eds) Asymptotic Combinatorics with Applications to Mathematical Physics Lecture Notes in Mathematics, vol 1815. Springer 2003
- G. Olshanski, Asymptotic representation theory, Lecture notes 2009–2010
- https://ncatlab.org/nlab/show/asymptotic+representation+theory

### Translation (Japanese)

## 漸近表現論

当面は以下を参照のこと。

- Vershik, Anatoly.「『非常に大きい』と『無限』の間：漸近表現論」。『Probability and Mathematical Statistics』、33(2)、467–476。2022年10月21日取得。
- Anatoly Vershik, Two lectures on the asymptotic representation theory and statistics of Young diagrams, In: Vershik A.M., Yakubovich Y. (eds) Asymptotic Combinatorics with Applications to Mathematical Physics Lecture Notes in Mathematics, vol 1815. Springer 2003
- G. オルシャンスキー著『漸近表現論』講義ノート（2009–2010年）
- https://ncatlab.org/nlab/show/asymptotic+representation+theory

---

## Section 33

### Original (English)

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

### Translation (Japanese)

## 関連項目

- 表現論の用語集
- 表現論のトピック一覧
- 調和解析のトピック一覧
- カスプ形式の哲学
- 表現 (数学)

---

## Section 34

### Original (English)

## Notes

### Translation (Japanese)

## 脚注

---

## Section 35

### Original (English)

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

### Translation (Japanese)

## 参考文献

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

---

## Section 36

### Original (English)

## External links

- "Representation theory", Encyclopedia of Mathematics, EMS Press, 2001 [1994]
- Alexander Kirillov Jr., An introduction to Lie groups and Lie algebras (2008).  Textbook, preliminary version pdf downloadable from author's home page.
- Kevin Hartnett, (2020), article on representation theory in Quanta magazine
- Grabowski, Jan (2025). Representation Theory: A Categorical Approach. Open Book Publishers. ISBN 978-1-80511-716-2.

### Translation (Japanese)

## 外部リンク

- "Representation theory", Encyclopedia of Mathematics, EMS Press, 2001 [1994]
- Alexander Kirillov Jr., An introduction to Lie groups and Lie algebras (2008).  Textbook, preliminary version pdf downloadable from author's home page.
- Kevin Hartnett, (2020), article on representation theory in Quanta magazine
- Grabowski, Jan (2025). Representation Theory: A Categorical Approach. Open Book Publishers. ISBN 978-1-80511-716-2.

---

