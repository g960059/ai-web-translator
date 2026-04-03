表現論は、数学の一分野であり、抽象的な代数的構造の元をベクトル空間上の線形変換として表現することでそれらの構造を研究し、またそれらの抽象的代数的構造上の加群を研究するものである。[1][2] 本質的に、表現とは抽象的な代数的対象を、その元を行列とその代数的演算（例えば、行列の加法、行列の乗法）によって記述することで、より具体的にするものである。

このような記述が可能な代数的対象には、群、結合代数、リー代数が含まれる。これらの中で最も顕著な（そして歴史的に最初である）ものは群の表現論であり、そこでは群の元が、群の演算が行列の乗法となるように可逆行列によって表現される。[3][4]

表現論は、抽象代数学における問題を、よく理解されている線形代数学の問題に帰着させるため、有用な手法である。[5][6] より抽象的な対象を馴染み深い線形代数学の言葉で表現することは、より抽象的な理論における性質を解明し、計算を簡略化することができる。例えば、群を無限次元のヒルベルト空間で表現することで、解析学の手法を群論に適用することが可能となる。[7][8] さらに、表現論は、物理的システムの対称性群がそのシステムを記述する方程式の解にどのような影響を与えるかを記述できるため、物理学においても重要である。[9]

表現論は数学のあらゆる分野に浸透している。表現論の応用は多岐にわたる。[10] 代数学への影響に加え、表現論は

- 調和解析を通じてフーリエ解析を一般化し、[11]
- 不変式論およびエルランゲン・プログラムを通じて幾何学と結びつき、[12]
- 保型形式およびラングランズ・プログラムを通じて数論に影響を与えている。[13]
表現論へのアプローチは数多く存在する。同一の対象を、代数幾何学、加群論、解析的数論、微分幾何学、作用素論、代数的組合せ論、そしてトポロジーの手法を用いて研究することができる。[14]

表現論の成功は、数多くの一般化をもたらした。最も一般的なものの一つに圏論がある。[15] 表現論が適用される代数的対象は特定の種類の圏と見なすことができ、表現はその対象の圏からベクトル空間の圏への関手と見なすことができる。[4] この記述は、二つの自然な一般化を示唆している。第一に、代数的対象をより一般的な圏に置き換えること、第二に、ベクトル空間という標的の圏を、他のよく理解された圏に置き換えることである。

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
  
である場合を考えよう。これは、数または上の 列ベクトルからなる標準的な n 次元空間である。それぞれの場合において、表現論の考え方は、
  
    
      
        n
        ×
        n
      
    
    {\displaystyle n\times n}
  
の数または数からなる 行列を用いることで、抽象代数学を具体的に実行することにある。

これを行うことができる代数的対象には、群、結合代数、リー代数という3つの主要な種類が存在する。[16][4]

- すべての可逆
  
    
      
        n
        ×
        n
      
    
    {\displaystyle n\times n}
  
行列の集合は、行列の乗法に関して群をなし、群の表現論は、群の元を可逆行列として記述（表現）することによってその群を解析する。
- 行列の加法と乗法はすべての
  
    
      
        n
        ×
        n
      
    
    {\displaystyle n\times n}
  
行列の集合を結合代数へと変える。したがって、それに対応する結合代数の表現論が存在する。
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
  
および任意のベクトル空間
  
    
      
        V
      
    
    {\displaystyle V}
  
（
  
    
      
        
          F
        
      
    
    {\displaystyle \mathbb {F} }
  
上）に一般化される。行列は線形写像に、行列の積は合成に置き換わり、群
  
    
      
        
          GL
        
        (
        V
        ,
        
          F
        
        )
      
    
    {\displaystyle {\text{GL}}(V,\mathbb {F} )}
  
（
  
    
      
        V
      
    
    {\displaystyle V}
  
の自己同型群）、
  
    
      
        
          
            End
          
          
            
              F
            
          
        
        (
        V
        )
      
    
    {\displaystyle {\text{End}}_{\mathbb {F} }(V)}
  
（
  
    
      
        V
      
    
    {\displaystyle V}
  
のすべての自己準同型からなる結合代数）、および対応するリー代数
  
    
      
        
          
            g
            l
          
        
        (
        V
        ,
        
          F
        
        )
      
    
    {\displaystyle {\mathfrak {gl}}(V,\mathbb {F} )}
  
が存在する。

### 定義

#### 作用

表現を定義する方法には2通りある。[17] 第1の方法は作用の概念を用いるものであり、行列が行列の積によって列ベクトルに作用する様式を一般化したものである。

群の表現とは
  
    
      
        G
      
    
    {\displaystyle G}
  
あるいは（結合代数またはリー代数）
  
    
      
        A
      
    
    {\displaystyle A}
  
ベクトル空間上の
  
    
      
        V
      
    
    {\displaystyle V}
  
は、写像である
  
    
      
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
  
であり、二つの性質を持つ。

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

### 用語

ベクトル空間 V は φ の表現空間と呼ばれ、その（有限次元の場合の）次元は表現の次元（[18]にあるように、時に次数とも呼ばれる）と呼ばれる。準同型 φ が文脈から明らかな場合には、V 自体を表現と呼ぶことも一般的である。そうでない場合は、記法 (V,φ) を用いて表現を表すことができる。

V が有限次元 n であるとき、V の基底を選択することで V を Fn と同一視でき、したがって体 F に成分を持つ行列表現を得ることができる。

有効な表現または忠実な表現とは、準同型 φ が単射であるような表現 (V,φ) のことである。

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
  
への同変写像とは、すべての
  
    
      
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
  
に対して
  
    
      
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
  
を満たす線形写像
  
    
      
        α
        :
        V
        →
        W
      
    
    {\displaystyle \alpha :V\rightarrow W}
  
のことである。
  
    
      
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
  
を用いて表現すれば、これはすべての
  
    
      
        g
      
    
    {\displaystyle g}
  
∈
  
    
      
        G
      
    
    {\displaystyle G}
  
に対して
  
    
      
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
  
が成り立つことを意味し、すなわち以下の 可換図式が成り立つ。

結合代数やリー代数の表現に対する同変写像も同様に定義される。
  
    
      
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
  
の場合には、時として
  
    
      
        G
      
    
    {\displaystyle G}
  
写像や
  
    
      
        G
      
    
    {\displaystyle G}
  
線形写像と呼ばれることもある。[19]

同型な表現は、実用上の目的においては「同一」である。それらは表現される群や代数について同一の情報を提供する。したがって、表現論は同型を除いて表現を分類することを目的とする。

### 部分表現、商、および既約表現

もし
  
    
      
        (
        V
        ,
        ψ
        )
      
    
    {\displaystyle (V,\psi )}
  
が（例えば）群
  
    
      
        G
      
    
    {\displaystyle G}
  
の表現であり、かつ
  
    
      
        W
      
    
    {\displaystyle W}
  
が
  
    
      
        V
      
    
    {\displaystyle V}
  
の線形部分空間であって、
  
    
      
        G
      
    
    {\displaystyle G}
  
の作用によって不変である、すなわちすべての
  
    
      
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
  
（セールはこれを
  
    
      
        W
      
    
    {\displaystyle W}
  
が
  
    
      
        G
      
    
    {\displaystyle G}
  
の下で安定であると呼ぶ[18]）ならば、
  
    
      
        W
      
    
    {\displaystyle W}
  
は部分表現と呼ばれる。
  
    
      
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
  
への制限であるから、
  
    
      
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
  
という包含写像は同変写像となる。商空間
  
    
      
        V
        
          /
        
        W
      
    
    {\displaystyle V/W}
  
もまた
  
    
      
        G
      
    
    {\displaystyle G}
  
の表現にすることができる。もし
  
    
      
        V
      
    
    {\displaystyle V}
  
が自明な部分空間 {0} と
  
    
      
        V
      
    
    {\displaystyle V}
  
自身という、ちょうど2つの部分表現しか持たないならば、その表現は既約であると言われる。[20]

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
  
は、その核がおよび像が部分表現であるため、零写像であるか、あるいは同型である。特に
  
    
      
        V
        =
        
          V
          ′
        
      
    
    {\displaystyle V=V'}
  
の場合、
  
    
      
        V
      
    
    {\displaystyle V}
  
の同変自己準同型は、基礎体F上の結合的可除代数をなすことが示される。もしFが代数閉体であれば、既約表現の同変自己準同型は恒等写像のスカラー倍のみである。

既約表現は、多くの群の表現論における構成要素である。表現
  
    
      
        V
      
    
    {\displaystyle V}
  
が既約でない場合、それはある意味でより「単純な」部分表現と商表現から構成される。例えば、
  
    
      
        V
      
    
    {\displaystyle V}
  
が有限次元であれば、部分表現と商表現の次元はともに小さくなる。表現が部分表現を持ちながら、非自明な既約成分を一つしか持たない反例も存在する。例えば、加法群
  
    
      
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
  
を持つ。この群において、ベクトル
  
    
      
        
          
            
              [
              
                
                  
                    1
                  
                  
                    0
                  
                
              
              ]
            
          
          
            
              T
            
          
        
      
    
    {\displaystyle {\begin{bmatrix}1&0\end{bmatrix}}^{\mathsf {T}}}
  
はこの準同型によって固定されるが、その補空間は
  
    
      
        
          
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
  
に写されるため、既約部分表現は一つしか得られない。これはすべての冪単群について成り立つ。[21]: 112

### 直和と既約分解不可能な表現

(V,φ) および (W,ψ) を（例えば）群 G の表現とするとき、V と W の直和は、次の方程式によって標準的な方法で表現となる。

2つの表現の直和は、群 G に関して、個々の表現が持つ以上の情報を付加するものではない。ある表現が2つの非自明な真の部分表現の直和である場合、それは分解可能であると言われる。そうでない場合は、分解不可能であると言われる。

### 完全可約性

好都合な状況下では、すべての有限次元表現は既約表現の直和となる。このような表現は半単純であると言われる。この場合、既約表現のみを理解すれば十分である。この「完全可約性」という現象が発生する例（少なくとも標数0の体上）には、有限群（マシュケの定理を参照）、コンパクト群、半単純リー代数などがある。

完全可約性が成り立たない場合には、部分表現による商の拡大を用いて、分解不可能な表現がどのように構成されるかを理解する必要がある。

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

この積は、余代数上の余積として認識できる。一般に、既約表現のテンソル積は既約とは限らない。テンソル積を既約表現の直和に分解する過程は、クレブシュ・ゴルダン理論として知られている。

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
  
を持つ2つの表現のテンソル積をとる場合、
  
    
      
        
          l
          
            1
          
        
        ≥
        
          l
          
            2
          
        
      
    
    {\displaystyle l_{1}\geq l_{2}}
  
と仮定する。すると、テンソル積はラベル
  
    
      
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

## 分野とトピック

表現論は、その分野の多さと、群や代数の表現を研究するアプローチの多様性において顕著である。すべての理論はすでに議論した基本概念を共有しているものの、細部においては大きく異なる。その違いは少なくとも以下の3点に集約される。

1. 表現論は、表現される代数的な対象の種類に依存する。群、結合代数、リー代数にはいくつかの異なるクラスが存在し、それぞれの表現論は独自の特色を備えている。
1. 表現論は、代数的対象が表現されるベクトル空間の性質に依存する。最も重要な区別は、有限次元表現と無限次元表現の間にある。無限次元の場合、追加の構造が重要となる（例えば、その空間がヒルベルト空間か、バナッハ空間かなど）。有限次元の場合にも、追加の代数的構造を課すことができる。
1. 表現論は、ベクトル空間が定義される体の種類に依存する。最も重要なケースは、複素数体、実数体、有限体、およびp進数体である。正標数の体や、代数閉体ではない体については、さらなる困難が生じる。

### 有限群

群表現は、有限群の研究において非常に重要なツールである。[25] また、有限群論を幾何学や結晶学に応用する際にも現れる。[26]有限群の表現は、一般理論の多くの特徴を示しており、表現論の他の分野やトピックへの道筋を示している。

標数0の体上では、有限群 G の表現は多くの便利な性質を持つ。第一に、G の表現は半単純（完全可約）である。これはマシュケの定理の帰結であり、G 表現 W の任意の部分表現 V は G 不変な補空間を持つことを述べている。一つの証明法は、W から V への任意の射影 π を選び、それを次のように定義される平均 πG に置き換えることである。

πG は同変であり、その核は求める補空間となる。

有限次元 G 表現は指標理論を用いて理解できる。表現 φ: G → GL(V) の指標とは、次のように定義される類関数 χφ: G → F である。

ここで
  
    
      
        
          T
          r
        
      
    
    {\displaystyle \mathrm {Tr} }
  
はトレースである。Gの既約表現は、その指標によって完全に決定される。

マシュケの定理は、素数 p が G の位数と互いに素である限り、有限体のような正標数 p の体に対してもより一般的に成り立つ。p と |G| が共通因子を持つ場合、G 表現には...半単純ではない表現であり、これはモジュラー表現論と呼ばれる分野で研究される。

平均化の手法を用いると、Fが実数体または複素数体である場合、任意のG-表現はV上の内積
  
    
      
        ⟨
        ⋅
        ,
        ⋅
        ⟩
      
    
    {\displaystyle \langle \cdot ,\cdot \rangle }
  
を保存することが示される。すなわち、

すべての g ∈ G および v, w ∈ W に対して成り立つ。したがって、任意の G 表現はユニタリ表現となる。

ユニタリ表現は自動的に半単純となる。なぜなら、マシュケの定理の結果は部分表現の直交補空間をとることで証明できるからである。有限群ではない群の表現を研究する際、ユニタリ表現は有限群の実表現や複素表現の優れた一般化を提供する。

平均化に依存するマシュケの定理やユニタリ性といった結果は、適切な積分の概念を定義できれば、平均を積分に置き換えることでより一般的な群へと拡張できる。これはコンパクト位相群（コンパクトリー群を含む）に対してハール測度を用いることで可能となり、その結果得られる理論は抽象調和解析として知られている。

任意の体上において、優れた表現論を持つ別の有限群のクラスとしてリー型の有限群がある。重要な例として、有限体上の線形代数群が挙げられる。線形代数群やリー群の表現論は、これらの例を無限次元群へと拡張するものであり、後者はリー環の表現と密接に関連している。有限群における指標理論の重要性は、リー群やリー環の表現におけるウェイトの理論に対応するものがある。

有限群 G の表現は、群環 F[G] を介して代数の表現と直接結びついている。これは F 上のベクトル空間であり、G の元を基底とし、群演算、線形性、および群演算とスカラー倍が可換であるという要件によって定義される乗法演算を備えている。

### モジュラー表現

有限群 G のモジュラー表現とは、その標数が |G| と互いに素ではない体上の表現であり、そのためマシュケの定理はもはや成立しない（|G| が F 内で可逆ではなく、したがってそれで割ることができないためである）。[27] それにもかかわらず、リチャード・ブラウアーは指標理論の多くをモジュラー表現へと拡張し、この理論は有限単純群の分類に向けた初期の進展において重要な役割を果たした。特に、そのシロー2部分群が「小さすぎる」ために純粋な群論的手法では特徴付けが困難であった単純群に対して重要であった。[28]

モジュラー表現は群論への応用に留まらず、数学の他の分野、例えば代数幾何学、符号理論、組合せ論、数論などにおいても自然に現れる。

### ユニタリ表現

群 G のユニタリ表現とは、実または（通常は）複素ヒルベルト空間 V 上の G の線形表現 φ であって、すべての g ∈ G に対して φ(g) がユニタリ演算子となるものである。このような表現は、特にヘルマン・ワイルの影響により、1920年代以降量子力学において広く応用されてきた。[29] そしてこれが理論の発展を促し、特にユージン・ウィグナーによるポアンカレ群の表現の解析を通じて顕著な進展が見られた。[30]（特定の応用で有用な群だけでなく、任意の群 G に対する）ユニタリ表現の一般理論を構築する先駆者の一人はジョージ・マッキーであり、1950年代から1960年代にかけてハリシュ＝チャンドラらによって広範な理論が展開された。

主要な目標は、G の既約ユニタリ表現の空間である「ユニタリ双対」を記述することである。[32] この理論は、G が局所コンパクトな（ハウスドルフ）位相群であり、表現が強連続である場合に最もよく発展している。[11] G が可換群である場合、ユニタリ双対は単なる指標の空間となる。一方、G がコンパクトである場合、ピーター・ワイルの定理により、既約ユニタリ表現は有限次元であり、ユニタリ双対は離散的であることが示される。[33] 例えば、G が円周群 S1 である場合、指標は整数によって与えられ、ユニタリ双対は Z となる。

非コンパクトな群 G に対して、どの表現がユニタリ表現であるかという問題は繊細である。既約ユニタリ表現は「許容的」（ハリシュ＝チャンドラ加群として）でなければならず、どの許容的表現が非退化な不変半双線形形式を持つかを判定することは容易であるが、この形式がいつ正定値となるかを決定することは困難である。実簡約リー群（後述）のような比較的扱いやすい群に対してさえ、ユニタリ双対の有効な記述は、表現論における重要な未解決問題のままである。これは、SL(2,R)やローレンツ群など、多くの特定の群については解決されている。簡約リー群（後述）のような比較的扱いやすい群に対してさえ、ユニタリ双対の有効な記述は、表現論における重要な未解決問題のままである。これは、SL(2,R)やローレンツ群など、多くの特定の群については解決されている。[34]

### 調和解析

円周群 S1 と整数 Z の間の双対性、あるいはより一般にトーラス Tn と Zn の間の双対性は、解析学においてフーリエ級数の理論としてよく知られている。同様に、フーリエ変換は、実ベクトル空間上の指標の空間が双対ベクトル空間であるという事実を表現している。したがって、ユニタリ表現論と調和解析は密接に関連しており、抽象調和解析はこの関係を利用して、局所コンパクト位相群および関連する空間上の関数の解析を展開する。[11]

主要な目標は、フーリエ変換とプランシュレルの定理の一般形式を提供することである。これは、ユニタリ双対上の測度を構成し、G 上の二乗可積分関数の空間 L2(G) における G の正則表現と、ユニタリ双対上の L2 関数の空間における表現との間の同型を構築することによって行われる。ポントリャーギン双対性とピーター＝ワイルの定理は、それぞれ可換群およびコンパクト群 G に対してこれを達成する。[33][35]

別のアプローチとして、既約表現だけでなく、すべてのユニタリ表現を考慮する方法がある。これらは圏を形成し、田中＝クレイン双対性は、コンパクト群をそのユニタリ表現の圏から復元する方法を提供する。

群が可換でもコンパクトでもない場合、プランシュレルの定理やフーリエ逆変換の類似物を持つ一般理論は知られていない。ただし、アレクサンドル・グロタンディークは、田中＝クレイン双対性を線形代数群とタナカ圏の間の関係へと拡張した。

調和解析は、群 G 上の関数の解析から、G の等質空間上の関数の解析へと拡張されてきた。この理論は特に対称空間に対してよく発展しており、保型形式（後述）の理論を提供している。

### リー群

リー群とは、滑らかな多様体でもある群のことである。実数体または複素数体上の多くの古典的な行列群はリー群である。[36] 物理学や化学において重要な群の多くはリー群であり、その表現論はこれらの分野における群論の応用に不可欠である。[9]

リー群の表現論は、まずコンパクト群を考慮することから展開できる。これにはコンパクト群の表現論の結果が適用される。[32] この理論は、ワイルのユニタリトリックを用いて半単純リー群の有限次元表現へと拡張できる。各半単純実リー群 G は、複素化を持ち、それは複素リー群 Gc である。この複素リー群は極大コンパクト部分群 K を持つ。G の有限次元表現は K の表現と密接に対応する。

一般的なリー群は、可解リー群と半単純リー群の半直積である（レヴィ分解）。[37]可解リー群の表現の分類は一般には困難であるが、実際的な場合には容易であることも多い。半直積の表現は、マッキー理論と呼ばれる一般的な結果を用いて解析できる。これは、ポアンカレ群の表現に関するウィグナーの分類で用いられた手法を一般化したものである。

### リー代数

体 F 上のリー環とは、リー括弧積と呼ばれる歪対称な双線型演算を備え、ヤコビ恒等式を満たす F 上のベクトル空間である。リー環は、特に次のような対象の接空間として現れる。リー群の単位元における接空間であり、それゆえ「無限小対称性」として解釈される。[37] リー群の表現論への重要なアプローチは、対応するリー環の表現論を研究することであるが、リー環の表現自体も本質的な興味の対象となる。[38]

リー環はリー群と同様に、半単純部分と可解部分へのレヴィ分解を持つが、可解リー環の表現論は一般には困難である。対照的に、半単純リー環の有限次元表現は、エリー・カルタンの研究を経て完全に解明されている。半単純リー環 𝖌 の表現は、カルタン部分環を選択することで解析される。これは本質的に、リー括弧積がゼロ（「可換」）となる 𝖌 の一般的な極大部分環 𝖍 である。𝖌 の表現は次のように分解できる。𝖍 の作用に対する固有空間であり、指標の無限小的な類似物であるウェイト空間。半単純リー環の構造により、表現の解析は、現れうるウェイトに関する容易に理解可能な組合せ論へと帰着される。[37]

#### 無限次元リー代数

表現が研究されている無限次元リー環には多くのクラスが存在する。その中でも重要なクラスがカッツ・ムーディ代数である。[39] これらは、独立に発見したヴィクター・カッツとロバート・ムーディの名にちなんでいる。これらの代数は有限次元の半単純リー環を一般化したものである。であり、その組合せ論的性質の多くを共有している。これは、半単純リー環の表現と同様の方法で理解できる表現のクラスを持つことを意味する。

アフィン・リー環はカッツ・ムーディ代数の特殊なケースであり、数学および理論物理学、特に共形場理論や可解模型の理論において重要な意味を持つ。カッツは、ある種の組合せ論的恒等式であるマクドナルド恒等式の洗練された証明を発見した。これはアフィン・カッツ・ムーディ代数の表現論に基づいている。

#### リー超代数

リー超代数はリー環の一般化であり、基礎となるベクトル空間が Z2 次数付きであり、リー括弧積の歪対称性とヤコビ恒等式の性質が符号によって修正される。その表現論はリー環の表現論と類似している。[40]

### 線形代数群

線型代数群（あるいはより一般にアフィン群スキーム）は、代数幾何学におけるリー群の類似物であるが、R や C だけでなく、より一般的な体上の対象である。特に有限体上では、これらはリー型の有限群を生じさせる。線型代数群はリー群と非常によく似た分類を持つが、その表現論はかなり異なり（かつ理解も進んでいない）、異なる手法を必要とする。なぜなら、ザリスキー位相は比較的弱く、解析学の手法がもはや利用できないからである。[41]

### 不変式論

不変式論は、群の表現を形成する関数への影響という観点から、代数多様体への作用を研究する。古典的には、この理論は、与えられた線型群の変換の下で変化しない、あるいは不変である多項式関数を明示的に記述するという問題を扱っていた。現代的なアプローチでは、これらの表現の既約表現への分解を解析する。[42]

無限群の不変式論は、線型代数学、特に二次形式や行列式の理論の発展と密接に結びついている。相互に強い影響を及ぼし合うもう一つの主題は射影幾何学であり、そこでは不変式論を用いて主題を整理することができる。1960年代には、この分野に新たな息吹が吹き込まれた。デヴィッド・マンフォードによる幾何学的不変式論の形式である。[43]

半単純リー群の表現論は不変式論にその起源を持ち[36]、表現論と代数幾何学の間の強い結びつきは、フェリックス・クラインのエルランゲン・プログラムを端緒として、微分幾何学においても多くの類似点を見出せる。エリー・カルタンの接続は、群と対称性を幾何学の中心に据えるものである。[44] 現代の発展において、表現論と不変式論はホロノミー、微分作用素、そして多変数複素解析といった多様な分野と結びついている。

### 保型形式と数論

保型形式とは、モジュラー形式を、同様の変換特性を持つ（おそらく多変数複素解析の）より一般的な解析関数へと一般化したものである。[45] この一般化には、モジュラー群PSL2 (R)および選択された合同部分群を、半単純リー群 G と離散部分群Γに置き換えることが含まれる。モジュラー形式が上半平面 H = PSL2 (R)/SO(2) の商空間上の微分形式と見なせるのと同様に、保型形式はΓ\G/K 上の微分形式（あるいはそれに類するもの）と見なすことができる。ここで K は（典型的には）G の極大コンパクト部分群である。ただし、商空間は通常特異点を持つため、注意が必要である。半単純リー群をコンパクト部分群で割った商は対称空間であり、したがって保型形式の理論は対称空間上の調和解析と密接に関連している。

一般理論の発展以前には、ヒルベルト・モジュラー形式やジーゲル・モジュラー形式を含む多くの重要な特殊ケースが詳細に研究されていた。この理論における重要な成果には、セルバーグ跡公式や、リーマン・ロッホの定理が保型形式の空間の次元を計算するために適用できるというロバート・ラングランズによる洞察がある。その後の「保型表現」という概念は、G が代数群であり、アデール的代数群として扱われる場合に極めて技術的な価値があることが判明した。その結果、保型形式の表現論的性質と数論的性質の関連性を中心に、ラングランズ・プログラムという壮大な哲学が展開されるに至った。[46]

### 結合代数

ある意味で、結合代数の表現は、群の表現とリー環の表現の両方を一般化するものである。群の表現は対応する群環や群代数の表現を誘導し、一方でリー環の表現は、その普遍包絡環の表現と一対一に対応する。しかし、一般的な結合代数の表現論は、群やリー環の表現論が持つような優れた性質をすべて備えているわけではない。

#### 加群論

結合代数の表現を考える際、基礎となる体を忘れて、単に結合代数を環とみなし、その表現を加群とみなすことができる。このアプローチは驚くほど実り多いものであり、表現論における多くの結果は、環上の加群に関する結果の特殊なケースとして解釈できる。

#### ホップ代数と量子群

ホップ代数は、群やリー環の表現論を特殊なケースとして保持しつつ、結合代数の表現論を改善する手段を提供する。特に、2つの表現のテンソル積は表現となり、双対ベクトル空間も同様である。

群に関連するホップ代数は可換代数の構造を持つため、一般的なホップ代数は量子群として知られている。ただし、この用語は、群やその普遍包絡環の変形として生じる特定のホップ代数に限定して使われることが多い。量子群の表現論は、例えば柏原の結晶基底などを通じて、リー群やリー環の表現論に驚くべき洞察をもたらした。

## 歴史

## 一般化

### 集合論的表現

群 G の集合 X 上の集合論的表現（群作用または置換表現とも呼ばれる）は、G から XX への関数 ρ によって与えられる。ここで XX はX から X への関数の集合であり、G のすべての g1, g2 および X のすべての x に対して次が成り立つ。

この条件と群の公理により、すべての G の元 g に対して ρ(g) が全単射（または置換）であることが導かれる。したがって、置換表現は G から X の対称群 SX への群準同型として等価に定義できる。

### 他の圏における表現

任意の群 G は単一の対象を持つ圏とみなすことができる。この圏における射は、単に G の元である。任意の圏 C が与えられたとき、G の C における表現とは、G から C への関手のことである。このような関手は、C 内の対象 X と、G から X の自己同型群 Aut(X) への群準同型を選択する。

C が体 F 上のベクトル空間の圏 VectF である場合、この定義は線形表現と等価である。同様に、集合論的表現とは単に集合の圏における G の表現にほかならない。

別の例として、位相空間の圏 Top を考える。Top における表現とは、G から位相空間 X の同相写像群への準同型である。

線形表現と密接に関連する3種類の表現は以下の通りである。

- 射影表現：射影空間の圏における表現。これらは「スカラー変換を除いて等しい線形表現」として記述できる。
- アフィン表現：アフィン空間の圏における表現。例えば、ユークリッド群はユークリッド空間にアフィン的に作用する。
- ユニタリ群および反ユニタリ群の余表現：射が線形変換または反線形変換である複素ベクトル空間の圏における表現。

### 圏の表現

群は圏であるため、他の圏の表現を考えることもできる。最も単純な一般化は、単一の対象を持つ圏であるモノイドへの拡張である。群は、すべての射が可逆であるモノイドである。一般的なモノイドは任意の圏において表現を持つ。集合の圏においては、これらはモノイド作用となるが、ベクトル空間や他の対象に対するモノイド表現も研究対象となる。

より一般的には、表現される圏が単一の対象しか持たないという仮定を緩めることができる。完全に一般化すれば、これは単に圏の間の関手の理論であり、特筆すべきことは少ない。

表現論に多大な影響を与えた特殊なケースとして、箙（クイバー）の表現論がある[15]。箙とは単なる有向グラフのことである。（ループや多重辺も許容される）。しかし、グラフ内のパスを考えることで、これを圏（および代数）にすることができる。このような圏や代数の表現は、表現論のいくつかの側面を明らかにしてきた。例えば、群に関する非半単純表現論の問題を、場合によっては箙に関する半単純表現論の問題に帰着させることが可能となる。

## 漸近表現論

当面は以下を参照のこと。

- Vershik, Anatoly.「『非常に大きい』と『無限』の間：漸近表現論」。『確率論と数理統計学』33(2):467–476。2022年10月21日取得。
- Anatoly Vershik, Two lectures on the asymptotic representation theory and statistics of Young diagrams, In: Vershik A.M., Yakubovich Y. (eds) Asymptotic Combinatorics with Applications to Mathematical Physics Lecture Notes in Mathematics, vol 1815. Springer 2003
- G. オルシャンスキー著『漸近表現論』、講義ノート（2009–2010年）
- https://ncatlab.org/nlab/show/asymptotic+representation+theory

## 関連項目

- 表現論の用語一覧
- 表現論のトピック一覧
- 調和解析のトピック一覧
- Numerical analysis
- カスプ形式の哲学
- 表現 (数学)
- Universal algebra

## 脚注

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

## 外部リンク

- "Representation theory", Encyclopedia of Mathematics, EMS Press, 2001 [1994]
- Alexander Kirillov Jr., An introduction to Lie groups and Lie algebras (2008).  Textbook, preliminary version pdf downloadable from author's home page.
- Kevin Hartnett, (2020), article on representation theory in Quanta magazine
- Grabowski, Jan (2025). Representation Theory: A Categorical Approach. Open Book Publishers. ISBN 978-1-80511-716-2.