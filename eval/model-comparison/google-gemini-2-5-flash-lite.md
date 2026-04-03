表現論（ひょうげんろん、英: Representation theory）は、数学の一分野であり、抽象的な代数構造の元を、ベクトル空間の線型変換として表現することによって、それらを研究するものである。また、それらの抽象的な代数構造上の加群を研究する。本質的に、表現とは、抽象的な代数的な対象の元を行列とその代数演算（例えば行列の加算、行列の乗算）によって記述することで、より具体的なものにするものである。

このような記述に適した代数的な対象には、群、結合代数、リー代数などがある。これらのうち最も著名なもの（そして歴史的に最初のもの）は、群の表現論であり、そこでは群の元が可逆な行列によって表現され、群の演算が行列の乗算となる。[3][4]群の表現論、すなわち群の元を群演算が行列乗算となるような可逆行列で表現する理論（しばしば最初のものとされる）である。

表現論は、抽象代数学の問題を、よく理解されている線形代数の問題に帰着させるため、有用な手法である。[5][6]表現論より抽象的な対象を、よく知られた線形代数の概念を用いて表現することで、その性質を明らかにしたり、より抽象的な理論における計算を単純化したりすることができる。例えば、群を無限次元のヒルベルト空間で表現することにより、解析学の手法を群論に応用することが可能になる。[7][8] さらに、表現論は物理学においても重要である。なぜなら、物理系の対称性群が、その系を記述する方程式の解にどのように影響するかを記述できるからである。[9]

## 表現論

より抽象的な対象を、よく知られた線形代数の概念を用いて表現することで、その性質を明らかにしたり、より抽象的な理論における計算を単純化したりすることができる。例えば、群を無限次元のヒルベルト空間で表現することにより、解析学の手法を群論に応用することが可能になる。[7]

表現論は数学の様々な分野に浸透している。表現論の応用は多岐にわたる。[10] 代数への影響に加え、表現論は

表現論には多くの異なるアプローチが存在する。同じ対象を、代数幾何学、加群論、解析的整数論、微分幾何学、作用素論、代数的組合せ論、そしてトポロジーの手法を用いて研究することができる。[14]

表現論の成功は、数多くの一般化をもたらしました。最も一般的なものの一つは圏論におけるものである。[15] 表現論が適用される代数的対象は特定の種類の圏として見ることができ、表現はその対象圏から関手と見なすことができます。ベクトル空間の圏への関手である。[4] この記述は、2つの自然な一般化を示唆しています。第一に、代数的対象をより一般的な圏で置き換えることができます。第二に、ベクトル空間のターゲット圏を、他のよく理解されている圏で置き換えることができます。

## 定義と概念

V
      
    
    {\displaystyle V}
  
を体
  
    
      
        
          F
        
      
    
    {\displaystyle \mathbb {F} }
  
上のベクトル空間とする。[6]例えば、
  
    
      
        V
      
    
    {\displaystyle V}
  
が実数または複素数上の列ベクトルの標準的なn次元空間である
  
    
      
        
          
            R
          
          
            n
          
        
      
    
    {\displaystyle \mathbb {R} ^{n}}
  
または
  
    
      
        
          
            C
          
          
            n
          
        
      
    
    {\displaystyle \mathbb {C} ^{n}}
  
であると仮定する。、それぞれの場合について。この場合、表現論の考え方は、実数または複素数の
  
    
      
        n
        ×
        n
      
    
    {\displaystyle n\times n}
  
な行列を用いて、抽象代数を具体的に扱うことである。

この操作が可能な主な代数的対象には、群、結合代数、およびリー代数の3種類があります。[16][4]

これは、任意の体
  
    
      
        
          F
        
      
    
    {\displaystyle \mathbb {F} }
  
および任意のベクトル空間
  
    
      
        V
      
    
    {\displaystyle V}
  
（
  
    
      
        
          F
        
      
    
    {\displaystyle \mathbb {F} }
  
上）に一般化され、行列の代わりに線形写像 [[a x=0>線形写像]]、行列の乗算の代わりに合成 [[a x=1>合成]] を用いる。すなわち、
  
    
      
        V
      
    
    {\displaystyle V}
  
の自己同型射 [[a x=3>自己同型射]] の群
  
    
      
        
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
  
のすべての自己準同型射 [[a x=2>自己準同型射]] の結合代数
  
    
      
        
          
            End
          
          
            
              F
            
          
        
        (
        V
        )
      
    
    {\displaystyle {\text{End}}_{\mathbb {F} }(V)}
  
、および対応するリー代数
  
    
      
        
          
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

表現を定義するには2つの方法があります。[17] 最初の方法は、行列が列ベクトルに行列乗算で作用する一般的な方法である作用の考え方を使用します。

群の表現
  
    
      
        G
      
    
    {\displaystyle G}
  
または（結合的またはリー）代数
  
    
      
        A
      
    
    {\displaystyle A}
  
ベクトル空間上の
  
    
      
        V
      
    
    {\displaystyle V}
  
は写像である
  
    
      
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
  
2つの性質を持つ。

結合代数に対する定義も同様であるが、結合代数は常に単位元を持つとは限らないため、その場合は式 (2.1) は省略される。式 (2.2) は行列の積の結合法則を抽象的に表現したものである。これは行列の交換子には当てはまらず、交換子にも単位元は存在しない。したがって、リー代数に対しては、任意のx1,x2∈Aおよびv∈Vに対して、
  
    
      
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
  
が成り立つことのみが要求される。ここで、x1,x2は行列の交換子MN−NMを一般化したリー括弧である。

#### 写像

表現を定義する第二の方法は、g ∈ G を線形写像 φ(g): V → V に送る写像 φ に焦点を当てるもので、これは

同様に他の場合も成り立つ。このアプローチはより簡潔で、より抽象的である。この観点からは、

### 用語

ベクトル空間Vはφの表現空間と呼ばれ、その次元（有限の場合）は表現の次元（文脈によっては次数とも呼ばれる）と呼ばれます。[18] 準同型φが文脈から明らかである場合、V自体を表現と呼ぶことも一般的ですが、そうでない場合は表記(V,φ)と表現を表すために使用できます。

Vが有限次元nである場合、VをFnと同一視するために基底を選択でき、したがって体Fの成分を持つ行列表現を復元できます。

有効または忠実な表現とは、準同型φが単射である表現(V,φ)のことである。

### 共変写像と同型

V
      
    
    {\displaystyle V}
  
と
  
    
      
        W
      
    
    {\displaystyle W}
  
が、群
  
    
      
        G
      
    
    {\displaystyle G}
  
の
  
    
      
        
          F
        
      
    
    {\displaystyle \mathbb {F} }
  
上の表現
  
    
      
        φ
      
    
    {\displaystyle \varphi }
  
および
  
    
      
        ψ
      
    
    {\displaystyle \psi }
  
を備えたベクトル空間である場合、
  
    
      
        V
      
    
    {\displaystyle V}
  
から
  
    
      
        W
      
    
    {\displaystyle W}
  
への同変写像とは、線形写像
  
    
      
        α
        :
        V
        →
        W
      
    
    {\displaystyle \alpha :V\rightarrow W}
  
であって、
  
    
      
        G
      
    
    {\displaystyle G}
  
のすべての
  
    
      
        g
      
    
    {\displaystyle g}
  
および
  
    
      
        V
      
    
    {\displaystyle V}
  
のすべての
  
    
      
        v
      
    
    {\displaystyle v}
  
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
  
を満たすものをいう。
  
    
      
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
  
の言葉でいえば、これは
  
    
      
        G
      
    
    {\displaystyle G}
  
のすべての
  
    
      
        g
      
    
    {\displaystyle g}
  
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
  
を意味する。すなわち、以下の図式が可換である。

随伴代数またはリー代数の表現に対する同変写像も同様に定義される。
  
    
      
        α
      
    
    {\displaystyle \alpha }
  
が可逆である場合、それは同型と呼ばれ、この場合
  
    
      
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
  
）は同型表現であり、等価表現とも呼ばれる。同変写像はしばしば表現の絡作用素と呼ばれる。また、群
  
    
      
        G
      
    
    {\displaystyle G}
  
の場合、それは時折
  
    
      
        G
      
    
    {\displaystyle G}
  
-写像または
  
    
      
        G
      
    
    {\displaystyle G}
  
-線形写像と呼ばれる。同値な表現。等化写像はしばしば絡み合い写像と呼ばれる。また、群の場合、それは時々-写像または-線形写像と呼ばれる。

同型な表現は、実際的な目的においては「同じ」である。それらは、表現されている群または代数に関する同じ情報を提供します。したがって、表現論は同型に至るまで表現を分類しようとします。同型まで

### 部分表現、商表現、既約表現

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

表現論 > 部分表現、商表現、既約表現既約表現の定義はシューアの補題を意味する。すなわち、既約表現間の
  
    
      
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
  
同変写像[[/x0]]は、その核と像が部分表現であるため、ゼロ写像か同型写像のいずれかである。特に、
  
    
      
        V
        =
        
          V
          ′
        
      
    
    {\displaystyle V=V'}
  
の場合、これは既約表現の
  
    
      
        V
      
    
    {\displaystyle V}
  
同変自己準同型が、基底体F上の結合的な斜体をなすことを示す。Fが代数的閉体である場合、既約表現の同変自己準同型は恒等写像のスカラー倍のみである。

多くの群に対する表現論の構成要素は既約表現である。表現
  
    
      
        V
      
    
    {\displaystyle V}
  
が既約でない場合、それはある意味で「より単純な」部分表現と商表現から構成される。例えば、
  
    
      
        V
      
    
    {\displaystyle V}
  
が有限次元の場合、部分表現と商表現の両方がより小さい次元を持つ。表現が部分表現を持つものの、非自明な既約成分が1つしかないという反例も存在する。

例えば、加法群
  
    
      
        (
        
          R
        
        ,
        +
        )
      
    
    {\displaystyle (\mathbb {R} ,+)}
  
には2次元表現
  
    
      
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
  
が存在する。この群は、この準同型によって固定されるベクトル
  
    
      
        
          
            
              [
              
                
                  
                    1
                  
                  
                    0
                  
                
              
              ]
            
          
          
            
              T
            
          
        
      
    
    {\displaystyle {\begin{bmatrix}1&0\end{bmatrix}}^{\mathsf {T}}}
  
を持つが、補空間は
  
    
      
        
          
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
  
に写像され、既約部分表現は1つしか存在しない。これはすべての単項群に当てはまる。[21]: 112

多くの群に対する表現論の構成要素は既約表現である。表現
  
    
      
        V
      
    
    {\displaystyle V}
  
が既約でない場合、それはある意味で「より単純な」部分表現と商表現から構成される。例えば、
  
    
      
        V
      
    
    {\displaystyle V}
  
が有限次元の場合、部分表現と商表現の両方がより小さい次元を持つ。表現が部分表現を持つものの、非自明な既約成分が1つしかないという反例も存在する。

例えば、加法群
  
    
      
        (
        
          R
        
        ,
        +
        )
      
    
    {\displaystyle (\mathbb {R} ,+)}
  
には2次元表現
  
    
      
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
  
が存在する。この群は、この準同型によって固定されるベクトル
  
    
      
        
          
            
              [
              
                
                  
                    1
                  
                  
                    0
                  
                
              
              ]
            
          
          
            
              T
            
          
        
      
    
    {\displaystyle {\begin{bmatrix}1&0\end{bmatrix}}^{\mathsf {T}}}
  
を持つが、補空間は
  
    
      
        
          
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
  
に写像され、既約部分表現は1つしか存在しない。これはすべての単項群に当てはまる。[21]: 112

### 直和と indecomposable な表現

If (V,φ) and (W,ψ) are representations of (say) a group G, then the direct sum of V and W is a representation, in a canonical way, via the equation

The direct sum of two representations carries no more information about the group G than the two representations do individually. If a representation is the direct sum of two proper nontrivial subrepresentations, it is said to be decomposable. Otherwise, it is said to be indecomposable.

### 完全可約性

In favorable circumstances, every finite-dimensional representation is a direct sum of irreducible representations: such representations are said to be semisimple. In this case, it suffices to understand only the irreducible representations. Examples where this "complete reducibility" phenomenon occurs (at least over fields of characteristic zero) include finite groups (see ,Maschke's theorem), compact groups, and semisimple Lie algebras.

In cases where complete reducibility does not hold, one must understand how indecomposable representations can be built from irreducible representations by using extensions of quotients by subrepresentations.

### 表現のテンソル積

群
  
    
      
        G
      
    
    {\displaystyle G}
  
の表現
  
    
      
        
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
  
が与えられたとする。このとき、テンソル積ベクトル空間
  
    
      
        
          V
          
            1
          
        
        ⊗
        
          V
          
            2
          
        
      
    
    {\displaystyle V_{1}\otimes V_{2}}
  
上で作用する G の表現
  
    
      
        
          ϕ
          
            1
          
        
        ⊗
        
          ϕ
          
            2
          
        
      
    
    {\displaystyle \phi _{1}\otimes \phi _{2}}
  
を次のように構成できる。[22]

群
  
    
      
        G
      
    
    {\displaystyle G}
  
の表現
  
    
      
        
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
  
が与えられたとする。このとき、テンソル積ベクトル空間
  
    
      
        
          V
          
            1
          
        
        ⊗
        
          V
          
            2
          
        
      
    
    {\displaystyle V_{1}\otimes V_{2}}
  
上で作用する G の表現
  
    
      
        
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
  
がリー環の表現である場合、使用すべき正しい公式は次のようになる。[23]

ϕ
          
            1
          
        
      
    
    {\displaystyle \phi _{1}}
  
と
  
    
      
        
          ϕ
          
            2
          
        
      
    
    {\displaystyle \phi _{2}}
  
がリー環の表現である場合、使用すべき正しい公式は次のようになる。[23]

This product can be recognized as the coproduct on a coalgebra. In general, the tensor product of irreducible representations is not irreducible; the process of decomposing a tensor product as a direct sum of irreducible representations is known as Clebsch–Gordan theory.

SU(2) 群の表現論（あるいは同等の、その複素化されたリー環
  
    
      
        
          s
          l
        
        (
        2
        ;
        
          C
        
        )
      
    
    {\displaystyle \mathrm {sl} (2;\mathbb {C} )}
  
の表現論）の場合、分解は容易に計算できる。[24]

既約表現は、非負整数または半整数であるパラメータ
  
    
      
        l
      
    
    {\displaystyle l}
  
によってラベル付けされる。その表現の次元は
  
    
      
        2
        l
        +
        1
      
    
    {\displaystyle 2l+1}
  
となる。2つの表現、ラベル
  
    
      
        
          l
          
            1
          
        
      
    
    {\displaystyle l_{1}}
  
と
  
    
      
        
          l
          
            2
          
        
        ,
      
    
    {\displaystyle l_{2},}
  
を持つ表現のテンソル積を取ると仮定する（ただし
  
    
      
        
          l
          
            1
          
        
        ≥
        
          l
          
            2
          
        
      
    
    {\displaystyle l_{1}\geq l_{2}}
  
と仮定する）。このとき、テンソル積は、ラベル
  
    
      
        l
      
    
    {\displaystyle l}
  
を持つ各表現の1つのコピーの直和に分解される。ここで
  
    
      
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
  
の値は 0, 1, 2 である。

したがって、次元
  
    
      
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

SU(2) 群の表現論（あるいは同等の、その複素化されたリー環
  
    
      
        
          s
          l
        
        (
        2
        ;
        
          C
        
        )
      
    
    {\displaystyle \mathrm {sl} (2;\mathbb {C} )}
  
の表現論）の場合、分解は容易に計算できる。[24]

既約表現は、非負整数または半整数であるパラメータ
  
    
      
        l
      
    
    {\displaystyle l}
  
によってラベル付けされる。その表現の次元は
  
    
      
        2
        l
        +
        1
      
    
    {\displaystyle 2l+1}
  
となる。2つの表現、ラベル
  
    
      
        
          l
          
            1
          
        
      
    
    {\displaystyle l_{1}}
  
と
  
    
      
        
          l
          
            2
          
        
        ,
      
    
    {\displaystyle l_{2},}
  
を持つ表現のテンソル積を取ると仮定する（ただし
  
    
      
        
          l
          
            1
          
        
        ≥
        
          l
          
            2
          
        
      
    
    {\displaystyle l_{1}\geq l_{2}}
  
と仮定する）。このとき、テンソル積は、ラベル
  
    
      
        l
      
    
    {\displaystyle l}
  
を持つ各表現の1つのコピーの直和に分解される。ここで
  
    
      
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
  
の値は 0, 1, 2 である。

したがって、次元
  
    
      
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

## 分岐とトピック

表現論はその分野の数と、群や代数の表現を研究するアプローチの多様性で注目に値する。すでに議論された基本的な概念はすべて理論に共通しているものの、詳細はかなり異なる。その違いは少なくとも3つある。

### 有限群

Group representations are a very important tool in the study of finite groups.[25] They also arise in the applications of finite group theory to geometry and crystallography.[26]Representations of finite groups exhibit many of the features of the general theory and point the way to other branches and topics in representation theory.

Over a field of characteristic zero, the representation of a finite group G has a number of convenient properties. First, the representations of G are semisimple (completely reducible). This is a consequence of Maschke's theorem, which states that any subrepresentation V of a G-representation W has a G-invariant complement. One proof is to choose any projectionπ from W to V and replace it by its average πG defined by

πG is equivariant, and its kernel is the required complement.

The finite-dimensional G-representations can be understood using character theory: the character of a representation φ: G → GL(V) is the class function χφ: G → F defined by

ここで
  
    
      
        
          T
          r
        
      
    
    {\displaystyle \mathrm {Tr} }
  
はトレースである。Gの既約表現は、その指標によって完全に決定される。

Maschke's theorem holds more generally for fields of positive characteristicp, such as the finite fields, as long as the prime p is coprime to the order of G. When p and |G| have a common factor, there are G-表現は半単純ではないものであり、これはモジュラー表現論と呼ばれる分野で研究される。

平均化技術はまた、Fが実数または複素数である場合、任意のG表現が内積を
  
    
      
        ⟨
        ⋅
        ,
        ⋅
        ⟩
      
    
    {\displaystyle \langle \cdot ,\cdot \rangle }
  
V上に保存することを示す。

すべてのg ∈ Gおよびv, w ∈ Wに対して成り立つ。したがって、任意のG-表現はユニタリである。

ユニタリ表現は自動的に半単純である。なぜなら、マスकेの定理は部分表現の直交補空間を取ることによって証明できるからである。有限でない群の表現を研究する際には、ユニタリ表現は有限群の実および複素表現の良い一般化を提供する。

マスケの定理やユニタリ性のような、平均化に依存する結果は、適切な積分概念を定義できるならば、積分によって平均を置き換えることで、より一般的な群に一般化できる。これはコンパクト位相群（コンパクトリー群を含む）に対してハール測度を用いて行うことができ、結果として得られる理論は抽象調和解析として知られている。

任意の体上で、良い表現論を持つ別の有限群のクラスは、リー型有限群である。重要な例は、有限体上の線形代数群である。線形代数群およびリー群の表現論は、これらの例を無限次元群に拡張するものであり、後者はリー環表現と密接に関連している。有限群の指標理論の重要性は、リー群およびリー環の表現のウェイトの理論における類似性を持つ。

有限群Gの表現は、群環F[G]を介して代数表現と直接結びついている。群環は、基底としてGの元を持ち、群演算によって定義される乗算演算、線形性、および群演算とスカラー乗算が可換であるという要件を備えた、F上のベクトル空間である。

### モジュラー表現

有限群Gのモジュラー表現は、その標数が|G|と互いに素でない体上の表現である。したがって、マスケの定理はもはや成り立たない（なぜなら|G|はFで可逆ではなく、それゆえ割ることができないからである）。[27]それにもかかわらず、リチャード・ブラウワーは指標理論の多くをモジュラー表現に拡張し、この理論は、特にSylow 2-部分群が「小さすぎる」ために純粋に群論的な方法では特徴付けが困難であった単純群に関して、有限単純群の分類に向けた初期の進展において重要な役割を果たした。[28]モジュラー表現は、群論への応用だけでなく、数学の他の分野、例えば代数幾何学、符号理論、組合せ論、数論などにも自然に現れる。

群Gのユニタリ表現とは、実数または（通常は）複素ヒルベルト空間V上の線形表現φであって、すべてのg ∈ Gに対してφ(g)がユニタリ作用素となるものである。このような表現は、特にヘルマン・ワイルの影響により、1920年代から量子力学に広く応用されており、

### ユニタリ表現

[29]これは、特にユージン・ウィグナーによるポアンカレ群の表現の解析を通じて、理論の発展を刺激した。[30]（特定の応用可能な群だけでなく）任意の群Gに対するユニタリ表現の一般理論の構築における先駆者の一人はジョージ・マッキーであり、広範な理論が1950年代と1960年代にハリス・チャンドラらによって開発された。[31]主要な目標は、Gの既約ユニタリ表現の空間である「ユニタリ双対」を記述することである。[32]理論は、Gが局所コンパクト（ハウスドルフ）位相群であり、表現が

強連続である場合に最もよく発達している。[11]Gがアーベル群の場合、ユニタリ双対は単に指標の空間であるが、Gがコンパクトな場合、ピーター・ワイルの定理は、既約ユニタリ表現は有限次元であり、ユニタリ双対は離散的であることを示している。[33]例えば、Gが円周群S1である場合、指標は整数によって与えられ、ユニタリ双対はZである。例えば、Gが円周群S1である場合、指標は整数によって与えられ、ユニタリ双対はZである。

非コンパクトなGについて、どの表現がユニタリであるかという問題は微妙なものである。既約ユニタリ表現は「許容可能」（ハリシュ＝チャンドラ加群として）でなければならず、非退化な不変な半双線形形式を持つ許容可能な表現のどれを検出するかは容易であるが、この形式が正定値であるかどうかを決定することは困難である。実数上の可解リー群（以下で議論する）のような比較的挙動の良い群でさえ、ユニタリ双対の有効な記述は、表現論における重要な未解決問題のままである。これは、SL(2,R)やローレンツ群のような多くの特定の群については解決されている。[34]

### 調和解析

円周群S1と整数Zとの双対性、あるいはより一般的にはトーラスTnとZnとの双対性は、解析学においてフーリエ級数の理論としてよく知られており、同様にフーリエ変換は、実ベクトル空間上の指標の空間が双対ベクトル空間であるという事実を表現している。したがって、ユニタリ表現論と調和解析は密接に関連しており、抽象調和解析は、局所コンパクト位相群および関連空間上の関数の解析を展開することによって、この関係を利用している。[11]

主要な目標は、フーリエ変換とプランシュレル定理の一般的な形式を提供することである。これは、ユニタリ双対上に測度を構成し、G上のL2(G)空間（G上の平方可積分関数）への正則表現とユニタリ双対上のL2関数空間への表現との間の同型写像を構築することによって達成される。ポントリャーギン双対とピーター・ワイルの定理は、それぞれアーベル群とコンパクト群Gに対してこれを達成する。[33][35]

別の手法として、既約表現だけでなく、すべてのユニタリ表現を考慮することが含まれる。これらは圏を形成し、タンナカ・クライン双対は、ユニタリ表現の圏からコンパクト群を復元する方法を提供する。

群がアーベル群でもコンパクト群でもない場合、プランシュレル定理やフーリエ逆定理のアナログとして知られている一般的な理論はないが、アレクサンドル・グロタンディークはタンナカ・クライン双対を、線形代数群とタンナキ圏の関係に拡張した。

調和解析は、群G上の関数の解析から、Gの斉ॅ空間上の関数へと拡張されてきた。この理論は特に対称空間に対してよく発達しており、保型形式（下記参照）の理論を提供する。

### リー群

リー群とは、滑らかな多様体でもある群である。実数または複素数上の多くの古典的な行列群はリー群である。[36]物理学や化学で重要な多くの群はリー群であり、それらの表現論はこれらの分野における群論の応用にとって極めて重要である。[9]

リー群の表現論は、まずコンパクト群を考慮することで展開できる。これにはコンパクト表現論の結果が適用される。[32]この理論は、半単純リー群の有限次元表現に、ワイルのユニタリトリックを用いて拡張できる。すなわち、各半単純実リー群Gは複素化を持ち、それは複素リー群Gcであり、この複素リー群は最大コンパクト部分群Kを持つ。Gの有限次元表現はKの表現と密接に対応する。

一般的なリー群は、可解リー群と半単純リー群の半直積である（レーヴィ分解）。[37]一般に、可解リー群の表現の分類は困難であるが、実用的なケースではしばしば容易である。半直積の表現は、ポアンカレ群の表現の分類に用いられたウィグナーの方法の一般化であるマッキー理論によって分析できる。[37]

### リー代数

体F上のリー代数とは、F上のベクトル空間であり、反対称な双線形演算（リー括弧と呼ばれる）を備え、ヤコビ恒等式を満たすものである。リー代数は、特に、リー群の単位元における接空間として現れ、それらを「無限小対称性」として解釈することにつながる。[37]リー群の表現論への重要なアプローチは、対応するリー代数の表現論を研究することであるが、リー代数の表現も固有の興味を持っている。[38]

リー代数もリー群と同様に、リーの分解によって半単純部分と可解部分に分解されるが、可解リー代数の表現論は一般に解析不能である。対照的に、半単純リー代数の有限次元表現は、エリエ・カルタンの研究により完全に理解されている。半単純リー代数𝖌の表現は、カルタン部分代数を選択することによって分析される。これは本質的に、リー括弧がゼロ（「アーベル」）である𝖌の任意の最大部分代数𝖍である。𝖌の表現は、𝖍の作用に対する固有空間であり、文字の無限小類似であるウェイト空間に分解できる。半単純リー代数の構造は、次に、表現の分析を、起こりうるウェイトの容易に理解できる組み合わせ論に還元する。[37]

#### 無限次元リー代数

無限次元リー代数の多くのクラスがあり、その表現が研究されてきた。これらのうち、重要なクラスはカッツ・ムーディ代数である。[39]これらは、独立に発見したビクター・カッツとロバート・ムーディにちなんで名付けられた。これらの代数は、有限次元半単純リー代数の一般化を形成する。、そしてそれらの多くの組み合わせ論的性質を共有している。これは、それらが半単純リー代数の表現と同様の方法で理解できる表現のクラスを持っていることを意味する。

アフィンリー代数は、カッツ・ムーディ代数の特別なケースであり、数学および理論物理学、特に共形場理論および厳密解模型の理論において特に重要である。カッツは、マクドナルド恒等式に関する特定の組み合わせ恒等式のエレガントな証明を発見した。、これはアフィンカッツ・ムーディ代数の表現論に基づいている。

#### リー超代数

リー超代数は、リー代数の一般化であり、その下のベクトル空間がZ2-次数付けを持ち、リー括弧の反対称性とヤコビ恒等式の性質が符号によって変更される。それらの表現論は、リー代数の表現論に似ている。[40]

### 線型代数群

線形代数群（またはより一般的には、アフィン群スキーム）は、代数幾何学におけるリー群のアナログであるが、RまたはCだけでなく、より一般的な体上のものである。特に、有限体上では、それらは有限リー型群を生み出す。線形代数群はリー群と非常に似た分類を持っているが、それらの表現論はかなり異なり（そしてはるかに理解されていない）、ザリスキー位相が比較的弱く、解析からの技術がもはや利用できないため、異なる技術を必要とする。[41]

### 不変式論

不変理論は、関数への作用の観点から代数多様体への作用を研究する。これは、群の表現を形成する。古典的には、この理論は、与えられた線形群からの変換の下で変化しない、または不変である多項式関数の明示的な記述の問題を扱っていた。現代的なアプローチは、これらの表現の既約表現への分解を分析する。[42]

無限群の不変理論は、線形代数、特に二次形式と行列式の理論の発展と切り離せない。相互に強く影響し合うもう一つの主題は射影幾何学であり、そこでは不変理論が主題を整理するために使用でき、1960年代には、David Mumfordによる幾何学的不変量理論の形式。[43]

半単純リー群の表現論には不変量理論に根ざしており[36]、表現論と代数幾何学の間の強い結びつきは、フェリックス・クラインのエルランゲン・プログラムやエリエ・カルタンの接続など、微分幾何学における多くの類似点を持っている。これらは群と対称性を幾何学の中心に据えるものである。[44]現代的な発展は、表現論と不変量理論を、ホロノミー、微分作用素、複素数変数関数論などの多様な分野と結びつけている。

### 保型形式と数論

保型形式は、より一般的な解析関数、おそらく複素数変数関数論の、同様の変換特性を持つものへのモジュラー形式の一般化である。[45]この一般化では、モジュラー群PSL2 (R)と選択された合同部分群を、半単純リー群Gと離散部分群Γに置き換える。モジュラー形式が上半平面H = PSL2 (R)/SO(2)の商の微分形式として見ることができるのと同様に、保型形式は、商Γ\G/K、ここでKは通常Gの極大コンパクト部分群である、の微分形式（または類似の対象）として見ることができる。ただし、商は通常特異点を持つため、注意が必要である。半単純リー群をコンパクト部分群で割った商は対称空間であり、したがって保型形式の理論は対称空間上の調和解析と密接に関連している。

一般理論の発展に先立ち、ヒルベルト保型形式やジーゲル保型形式を含む多くの重要な特殊ケースが詳細に検討された。この理論における重要な結果には、セルバーグの跡公式や、ロバート・ラングランズによるリーマン＝ロッホの定理が保型形式の空間の次元を計算するために適用できるという認識が含まれる。その後の「保型表現」という概念は、Gが代数群であり、アデール代数群として扱われる場合に対処する上で、技術的に非常に価値があることが証明された。その結果、表現と保型形式の数論的性質の関係を中心に、ラングランズ・プログラムという哲学全体が発展した。

### 結合代数

ある意味では、結合代数の表現は、群とリー環の表現の両方を一般化する。群の表現は、対応する群環または群代数の表現を誘導し、一方、リー環の表現は、その普遍包絡環の表現と一対一に対応する。しかし、一般の結合代数の表現論は、群やリー環の表現論が持つような良い性質をすべて持っているわけではない。

#### 加群論

結合代数の表現を考える際、その下の体（field）を忘れて、単に結合代数を環（ring）とみなし、その表現を加群（module）とみなすことができる。このアプローチは驚くほど実りが多い。表現論における多くの結果は、環上の加群に関する結果の特殊なケースとして解釈できるのである。

#### ホップ代数と量子群

ホップ代数は、群とリー環の表現論を特殊なケースとして保持しながら、結合代数の表現論を改善する方法を提供する。特に、2つの表現のテンソル積は表現であり、双対ベクトル空間も同様である。

群に関連付けられたホップ代数は可換代数構造を持つため、一般的なホップ代数は量子群として知られているが、この用語はしばしば群またはその普遍包絡環の変形として生じる特定のホップ代数に限定される。量子群の表現論は、例えば柏原晶基底などを通して、リー群とリー環の表現論に驚くべき洞察を加えている。

## 歴史

## 一般化

### 集合論的表現

群Gの集合Xへの群作用または置換表現としても知られる集合論的表現は、GからXからXへの関数の集合であるXXへの関数ρによって与えられる。ここで、すべてのg1、g2 ∈ Gおよびすべてのx ∈ Xに対して：

この条件と群の公理は、すべての g ∈ G に対して ρ(g) が全単射（または置換）であることを意味する。したがって、置換表現を G から X の対称群 SX への群準同型として同等に定義することができる。

### 他の圏における表現

任意の群 G は、単一の対象を持つ圏として見なすことができる。この圏における射は単に G の元である。任意の圏 C が与えられたとき、C における G の表現とは、G から C への関手である。そのような関手は、C における対象 X と、X の自己同型群 Aut(X) への群準同型を選択する。

C が体 F 上のベクトル空間の圏 VectF である場合、この定義は線形表現と同等である。同様に、集合論的表現は、単に集合の圏における G の表現である。

別の例として、位相空間の圏 Top を考える。Top における表現は、位相空間 X の同相写像群への G からの準同型である。

線型表現に密接に関連する3種類の表現を以下に示す。

### 圏の表現

群は圏であるため、他の圏の表現も考慮できる。最も単純な一般化はモノイドであり、これは単一の対象を持つ圏である。群は、すべての射が可逆であるモノイドである。一般的なモノイドは、任意の圏で表現を持つ。集合の圏では、これらはモノイド作用であるが、ベクトル空間やその他の対象へのモノイド表現も研究できる。

より一般的には、表現される圏が単一の対象のみを持つという仮定を緩和することができる。完全な一般性においては、これは単に圏間の関手の理論であり、ほとんど何も言えない。

表現論に大きな影響を与えた特別なケースとして、クィーバーの表現論がある。[15] クィーバーは単なる有向グラフである（ループや多重辺を許容する）が、グラフ内のパスを考慮することで圏（および代数）にすることができる。そのような圏/代数の表現は、例えば、群に関する半単純でない表現論の質問を、場合によってはクィーバーに関する半単純表現論の質問に還元することを可能にすることで、表現論のいくつかの側面を照らしてきた。

## 漸近表現論

現時点では、以下を参照のこと。

## 関連項目

## 脚注

## 参考文献

## 外部リンク