表現論は、群が与えられた構造に対してどのように作用するかを研究する数学の一分野である。

ここでは特に、群の作用がベクトル空間に対してどのように行われるかに焦点を当てる。とはいえ、他の群や集合に対する群の作用も考察の対象となる。詳細については、置換表現の節を参照されたい。

本稿では、いくつかの例外を除き、有限群のみを扱う。また、標数0の体上のベクトル空間に限定して議論を進める。標数0の代数閉体の理論は完全であるため、標数0の特定の代数閉体について成立する理論は、他のすべての標数0の代数閉体についても成立する。したがって、一般性を失うことなく、標数0の代数閉体上のベクトル空間を考察すればよい。
  
    
      
        
          C
        
        .
      
    
    {\displaystyle \mathbb {C} .}

表現論は数学の多くの分野で用いられるほか、量子化学や物理学においても利用されている。数学においては、とりわけ代数学において群の構造を調べるために用いられる。また、調和解析や数論への応用も存在する。例えば、現代的なアプローチにおいて保型形式に関する新たな知見を得るために表現論が用いられている。

## 定義

### 線形表現

V
      
    
    {\displaystyle V}
  
を
  
    
      
        K
      
    
    {\displaystyle K}
  
上のベクトル空間、
  
    
      
        G
      
    
    {\displaystyle G}
  
を有限群とする。
  
    
      
        G
      
    
    {\displaystyle G}
  
の線形表現とは、群準同型
  
    
      
        ρ
        :
        G
        →
        
          GL
        
        (
        V
        )
        =
        
          Aut
        
        (
        V
        )
        .
      
    
    {\displaystyle \rho :G\to {\text{GL}}(V)={\text{Aut}}(V).}
  
のことである。ここで
  
    
      
        
          GL
        
        (
        V
        )
      
    
    {\displaystyle {\text{GL}}(V)}
  
は 一般線形群、
  
    
      
        
          Aut
        
        (
        V
        )
      
    
    {\displaystyle {\text{Aut}}(V)}
  
は 自己同型群 を表す記号である。すなわち、線形表現とは、すべての
  
    
      
        s
        ,
        t
        ∈
        G
        .
      
    
    {\displaystyle s,t\in G.}
  
に対して
  
    
      
        ρ
        (
        s
        t
        )
        =
        ρ
        (
        s
        )
        ρ
        (
        t
        )
      
    
    {\displaystyle \rho (st)=\rho (s)\rho (t)}
  
を満たす写像
  
    
      
        ρ
        :
        G
        →
        
          GL
        
        (
        V
        )
      
    
    {\displaystyle \rho :G\to {\text{GL}}(V)}
  
である。ベクトル空間
  
    
      
        V
      
    
    {\displaystyle V}
  
は表現空間と呼ばれる。
  
    
      
        G
        .
      
    
    {\displaystyle G.}
  
の表現空間。しばしば「
  
    
      
        G
      
    
    {\displaystyle G}
  
の表現」という用語は、表現空間
  
    
      
        V
        .
      
    
    {\displaystyle V.}
  
そのものを指すためにも用いられる。

ベクトル空間の代わりに加群を用いた群の表現も、線形表現と呼ばれる。

表現
  
    
      
        ρ
        :
        G
        →
        
          GL
        
        (
        
          V
          
            ρ
          
        
        )
      
    
    {\displaystyle \rho :G\to {\text{GL}}(V_{\rho })}
  
の空間
  
    
      
        G
        .
      
    
    {\displaystyle G.}
  
を
  
    
      
        (
        ρ
        ,
        
          V
          
            ρ
          
        
        )
      
    
    {\displaystyle (\rho ,V_{\rho })}
  
と記す。空間
  
    
      
        V
      
    
    {\displaystyle V}
  
がどの表現に属するかが明らかな場合には、
  
    
      
        (
        ρ
        ,
        V
        )
      
    
    {\displaystyle (\rho ,V)}
  
という記法を用いることもある。

本稿では、最後の章を除き、有限次元表現空間の研究に限定する。多くの場合、
  
    
      
        V
      
    
    {\displaystyle V}
  
内の有限個のベクトルのみが関心の対象となるため、それらによって生成される部分表現を研究すれば十分である。この部分表現の表現空間は有限次元となる。

表現の次数とは、その表現空間
  
    
      
        V
        .
      
    
    {\displaystyle V.}
  
の次元のことである。表現
  
    
      
        ρ
        .
      
    
    {\displaystyle \rho .}
  
の次数を表すために、
  
    
      
        dim
        ⁡
        (
        ρ
        )
      
    
    {\displaystyle \dim(\rho )}
  
という記法が用いられることもある。

### 例

自明表現は、すべての
  
    
      
        s
        ∈
        G
        .
      
    
    {\displaystyle s\in G.}
  
に対して
  
    
      
        ρ
        (
        s
        )
        =
        
          Id
        
      
    
    {\displaystyle \rho (s)={\text{Id}}}
  
で与えられる。

群
  
    
      
        G
      
    
    {\displaystyle G}
  
の次数
  
    
      
        1
      
    
    {\displaystyle 1}
  
の表現とは、乗法的な 群
  
    
      
        ρ
        :
        G
        →
        
          
            GL
          
          
            1
          
        
        (
        
          C
        
        )
        =
        
          
            C
          
          
            ×
          
        
        =
        
          C
        
        ∖
        {
        0
        }
        .
      
    
    {\displaystyle \rho :G\to {\text{GL}}_{1}(\mathbb {C} )=\mathbb {C} ^{\times }=\mathbb {C} \setminus \{0\}.}
  
への準同型である。
  
    
      
        G
      
    
    {\displaystyle G}
  
の各元は有限位数を有するため、
  
    
      
        ρ
        (
        s
        )
      
    
    {\displaystyle \rho (s)}
  
の値は 1の冪根 となる。例えば、
  
    
      
        ρ
        :
        G
        =
        
          Z
        
        
          /
        
        4
        
          Z
        
        →
        
          
            C
          
          
            ×
          
        
      
    
    {\displaystyle \rho :G=\mathbb {Z} /4\mathbb {Z} \to \mathbb {C} ^{\times }}
  
を非自明な線形表現とする。
  
    
      
        ρ
      
    
    {\displaystyle \rho }
  
は群準同型であるから、
  
    
      
        ρ
        (
        
          0
        
        )
        =
        1.
      
    
    {\displaystyle \rho ({0})=1.}
  
を満たさねばならない。
  
    
      
        1
      
    
    {\displaystyle 1}
  
は
  
    
      
        G
        ,
        ρ
      
    
    {\displaystyle G,\rho }
  
を生成するため、
  
    
      
        ρ
        (
        1
        )
        .
      
    
    {\displaystyle \rho (1).}
  
における値によって決定される。また、
  
    
      
        ρ
      
    
    {\displaystyle \rho }
  
は非自明であるから、
  
    
      
        ρ
        (
        
          1
        
        )
        ∈
        {
        i
        ,
        −
        1
        ,
        −
        i
        }
        .
      
    
    {\displaystyle \rho ({1})\in \{i,-1,-i\}.}
  
である。したがって、
  
    
      
        ρ
      
    
    {\displaystyle \rho }
  
による
  
    
      
        G
      
    
    {\displaystyle G}
  
の像は、1の第4冪根からなる群の非自明な部分群でなければならないという結論が得られる。言い換えれば、
  
    
      
        ρ
      
    
    {\displaystyle \rho }
  
は以下の3つの写像のいずれかでなければならない。

G
        =
        
          Z
        
        
          /
        
        2
        
          Z
        
        ×
        
          Z
        
        
          /
        
        2
        
          Z
        
      
    
    {\displaystyle G=\mathbb {Z} /2\mathbb {Z} \times \mathbb {Z} /2\mathbb {Z} }
  
とし、
  
    
      
        ρ
        :
        G
        →
        
          
            GL
          
          
            2
          
        
        (
        
          C
        
        )
      
    
    {\displaystyle \rho :G\to {\text{GL}}_{2}(\mathbb {C} )}
  
を次のように定義される群準同型とする。

この場合、
  
    
      
        ρ
      
    
    {\displaystyle \rho }
  
は次数
  
    
      
        2.
      
    
    {\displaystyle 2.}
  
の
  
    
      
        G
      
    
    {\displaystyle G}
  
の線形表現である。

#### 置換表現

X
      
    
    {\displaystyle X}
  
を有限集合とし、
  
    
      
        G
      
    
    {\displaystyle G}
  
を
  
    
      
        X
        .
      
    
    {\displaystyle X.}
  
に作用する群とする。
  
    
      
        
          Aut
        
        (
        X
        )
      
    
    {\displaystyle {\text{Aut}}(X)}
  
を群演算として合成を用いた、
  
    
      
        X
      
    
    {\displaystyle X}
  
上のすべての置換からなる群とする。

有限集合に作用する群は、置換表現の定義としては十分であると見なされることがある。しかし、群が任意の有限集合ではなくベクトル空間に作用する線形表現の例を構築したい場合、異なるアプローチをとる必要がある。置換表現を構築するためには、
  
    
      
        dim
        ⁡
        (
        V
        )
        =
        
          |
        
        X
        
          |
        
        .
      
    
    {\displaystyle \dim(V)=|X|.}
  
を備えたベクトル空間
  
    
      
        V
      
    
    {\displaystyle V}
  
が必要である。
  
    
      
        V
      
    
    {\displaystyle V}
  
の基底は
  
    
      
        X
        .
      
    
    {\displaystyle X.}
  
の元によって添字付け可能である。置換表現とは、すべての
  
    
      
        s
        ∈
        G
        ,
        x
        ∈
        X
        .
      
    
    {\displaystyle s\in G,x\in X.}
  
に対して
  
    
      
        ρ
        (
        s
        )
        
          e
          
            x
          
        
        =
        
          e
          
            s
            .
            x
          
        
      
    
    {\displaystyle \rho (s)e_{x}=e_{s.x}}
  
で与えられる群準同型
  
    
      
        ρ
        :
        G
        →
        
          GL
        
        (
        V
        )
      
    
    {\displaystyle \rho :G\to {\text{GL}}(V)}
  
である。すべての線形写像
  
    
      
        ρ
        (
        s
        )
      
    
    {\displaystyle \rho (s)}
  
は、この性質によって一意に定義される。

例。
  
    
      
        X
        =
        {
        1
        ,
        2
        ,
        3
        }
      
    
    {\displaystyle X=\{1,2,3\}}
  
および
  
    
      
        G
        =
        
          Sym
        
        (
        3
        )
        .
      
    
    {\displaystyle G={\text{Sym}}(3).}
  
とする。このとき
  
    
      
        G
      
    
    {\displaystyle G}
  
は
  
    
      
        
          Aut
        
        (
        X
        )
        =
        G
        .
      
    
    {\displaystyle {\text{Aut}}(X)=G.}
  
を介して
  
    
      
        X
      
    
    {\displaystyle X}
  
に作用する。対応する線形表現は、
  
    
      
        σ
        ∈
        G
        ,
        x
        ∈
        X
        .
      
    
    {\displaystyle \sigma \in G,x\in X.}
  
に対して
  
    
      
        ρ
        (
        σ
        )
        
          e
          
            x
          
        
        =
        
          e
          
            σ
            (
            x
            )
          
        
      
    
    {\displaystyle \rho (\sigma )e_{x}=e_{\sigma (x)}}
  
となる
  
    
      
        ρ
        :
        G
        →
        
          GL
        
        (
        V
        )
        ≅
        
          
            GL
          
          
            3
          
        
        (
        
          C
        
        )
      
    
    {\displaystyle \rho :G\to {\text{GL}}(V)\cong {\text{GL}}_{3}(\mathbb {C} )}
  
である。

#### 左正則表現と右正則表現

G
      
    
    {\displaystyle G}
  
を群、
  
    
      
        V
      
    
    {\displaystyle V}
  
を
  
    
      
        
          |
        
        G
        
          |
        
      
    
    {\displaystyle |G|}
  
次元のベクトル空間とし、その基底
  
    
      
        (
        
          e
          
            t
          
        
        
          )
          
            t
            ∈
            G
          
        
      
    
    {\displaystyle (e_{t})_{t\in G}}
  
は
  
    
      
        G
        .
      
    
    {\displaystyle G.}
  
の元によって添字付けられているものとする。左正則表現は、
  
    
      
        X
        =
        G
        .
      
    
    {\displaystyle X=G.}
  
を選ぶことによって得られる置換表現の特別な場合である。これは、すべての
  
    
      
        s
        ,
        t
        ∈
        G
        .
      
    
    {\displaystyle s,t\in G.}
  
に対して
  
    
      
        ρ
        (
        s
        )
        
          e
          
            t
          
        
        =
        
          e
          
            s
            t
          
        
      
    
    {\displaystyle \rho (s)e_{t}=e_{st}}
  
であることを意味する。したがって、
  
    
      
        
          e
          
            1
          
        
      
    
    {\displaystyle e_{1}}
  
の像からなる族
  
    
      
        (
        ρ
        (
        s
        )
        
          e
          
            1
          
        
        
          )
          
            s
            ∈
            G
          
        
      
    
    {\displaystyle (\rho (s)e_{1})_{s\in G}}
  
は
  
    
      
        V
        .
      
    
    {\displaystyle V.}
  
の基底となる。左正則表現の次数は、群の位数に等しい。

右正則表現は、同様の準同型
  
    
      
        ρ
        (
        s
        )
        
          e
          
            t
          
        
        =
        
          e
          
            t
            
              s
              
                −
                1
              
            
          
        
        .
      
    
    {\displaystyle \rho (s)e_{t}=e_{ts^{-1}}.}
  
を用いて同じベクトル空間上に定義される。前述と同様に、
  
    
      
        (
        ρ
        (
        s
        )
        
          e
          
            1
          
        
        
          )
          
            s
            ∈
            G
          
        
      
    
    {\displaystyle (\rho (s)e_{1})_{s\in G}}
  
は
  
    
      
        V
        .
      
    
    {\displaystyle V.}
  
の基底である。左正則表現の場合と同様に、右正則表現の次数は
  
    
      
        G
        .
      
    
    {\displaystyle G.}
  
の位数に等しい。

両表現は
  
    
      
        
          e
          
            s
          
        
        ↦
        
          e
          
            
              s
              
                −
                1
              
            
          
        
        .
      
    
    {\displaystyle e_{s}\mapsto e_{s^{-1}}.}
  
を介して同型である。このため、これらは必ずしも区別されず、しばしば「正則表現」と総称される。

詳細に検討すると、次の結果が得られる。ある線形表現
  
    
      
        ρ
        :
        G
        →
        
          GL
        
        (
        W
        )
      
    
    {\displaystyle \rho :G\to {\text{GL}}(W)}
  
が左正則表現と同型であるための必要十分条件は、
  
    
      
        (
        ρ
        (
        s
        )
        w
        
          )
          
            s
            ∈
            G
          
        
      
    
    {\displaystyle (\rho (s)w)_{s\in G}}
  
が
  
    
      
        W
        .
      
    
    {\displaystyle W.}
  
の基底となるような
  
    
      
        w
        ∈
        W
        ,
      
    
    {\displaystyle w\in W,}
  
が存在することである。

例。
  
    
      
        G
        =
        
          Z
        
        
          /
        
        5
        
          Z
        
      
    
    {\displaystyle G=\mathbb {Z} /5\mathbb {Z} }
  
および
  
    
      
        V
        =
        
          
            R
          
          
            5
          
        
      
    
    {\displaystyle V=\mathbb {R} ^{5}}
  
を基底
  
    
      
        {
        
          e
          
            0
          
        
        ,
        …
        ,
        
          e
          
            4
          
        
        }
        .
      
    
    {\displaystyle \{e_{0},\ldots ,e_{4}\}.}
  
を持つものとする。このとき、左正則表現
  
    
      
        
          L
          
            ρ
          
        
        :
        G
        →
        
          GL
        
        (
        V
        )
      
    
    {\displaystyle L_{\rho }:G\to {\text{GL}}(V)}
  
は、
  
    
      
        k
        ,
        l
        ∈
        
          Z
        
        
          /
        
        5
        
          Z
        
        .
      
    
    {\displaystyle k,l\in \mathbb {Z} /5\mathbb {Z} .}
  
に対して
  
    
      
        
          L
          
            ρ
          
        
        (
        k
        )
        
          e
          
            l
          
        
        =
        
          e
          
            l
            +
            k
          
        
      
    
    {\displaystyle L_{\rho }(k)e_{l}=e_{l+k}}
  
によって定義される。右正則表現は、
  
    
      
        k
        ,
        l
        ∈
        
          Z
        
        
          /
        
        5
        
          Z
        
        .
      
    
    {\displaystyle k,l\in \mathbb {Z} /5\mathbb {Z} .}
  
に対して
  
    
      
        
          R
          
            ρ
          
        
        (
        k
        )
        
          e
          
            l
          
        
        =
        
          e
          
            l
            −
            k
          
        
      
    
    {\displaystyle R_{\rho }(k)e_{l}=e_{l-k}}
  
によって同様に定義される。

### 表現、加群、および畳み込み代数

G
      
    
    {\displaystyle G}
  
を有限群、
  
    
      
        K
      
    
    {\displaystyle K}
  
を可換環、
  
    
      
        K
        [
        G
        ]
      
    
    {\displaystyle K[G]}
  
を
  
    
      
        K
        .
      
    
    {\displaystyle K.}
  
上の
  
    
      
        G
      
    
    {\displaystyle G}
  
の群環とする。この代数は自由であり、その基底は
  
    
      
        G
        .
      
    
    {\displaystyle G.}
  
の元によって添字付けられる。多くの場合、この基底は
  
    
      
        G
      
    
    {\displaystyle G}
  
と同一視される。したがって、すべての元
  
    
      
        f
        ∈
        K
        [
        G
        ]
      
    
    {\displaystyle f\in K[G]}
  
は一意的に次のように表すことができる。

K
        [
        G
        ]
      
    
    {\displaystyle K[G]}
  
における乗法は、
  
    
      
        G
      
    
    {\displaystyle G}
  
における乗法を分配的に拡張したものである。

ここで、
  
    
      
        V
      
    
    {\displaystyle V}
  
を
  
    
      
        K
      
    
    {\displaystyle K}
  
–加群とし、
  
    
      
        ρ
        :
        G
        →
        
          GL
        
        (
        V
        )
      
    
    {\displaystyle \rho :G\to {\text{GL}}(V)}
  
を
  
    
      
        V
        .
      
    
    {\displaystyle V.}
  
における
  
    
      
        G
      
    
    {\displaystyle G}
  
の線形表現とする。すべての
  
    
      
        s
        ∈
        G
      
    
    {\displaystyle s\in G}
  
および
  
    
      
        v
        ∈
        V
      
    
    {\displaystyle v\in V}
  
に対して
  
    
      
        s
        v
        =
        ρ
        (
        s
        )
        v
      
    
    {\displaystyle sv=\rho (s)v}
  
を定義する。線形拡張により、
  
    
      
        V
      
    
    {\displaystyle V}
  
は左
  
    
      
        K
        [
        G
        ]
      
    
    {\displaystyle K[G]}
  
–加群の構造を備える。逆に、
  
    
      
        K
        [
        G
        ]
      
    
    {\displaystyle K[G]}
  
–加群
  
    
      
        V
      
    
    {\displaystyle V}
  
から出発して
  
    
      
        G
      
    
    {\displaystyle G}
  
の線形表現を得ることもできる。さらに、表現の準同型は群環の準同型と全単射に対応する。そのため、これらの用語は互換的に使用されることがある。[1][2] これは圏同型の一例である。

K
        =
        
          C
        
        .
      
    
    {\displaystyle K=\mathbb {C} .}
  
と仮定する。この場合、左
  
    
      
        
          C
        
        [
        G
        ]
      
    
    {\displaystyle \mathbb {C} [G]}
  
加群は、
  
    
      
        
          C
        
        [
        G
        ]
      
    
    {\displaystyle \mathbb {C} [G]}
  
自身が左正則表現に対応する。同様に、
  
    
      
        
          C
        
        [
        G
        ]
      
    
    {\displaystyle \mathbb {C} [G]}
  
を右
  
    
      
        
          C
        
        [
        G
        ]
      
    
    {\displaystyle \mathbb {C} [G]}
  
加群とすると、これは右正則表現に対応する。

以下では畳み込み代数を定義する。
  
    
      
        G
      
    
    {\displaystyle G}
  
を群とし、集合
  
    
      
        
          L
          
            1
          
        
        (
        G
        )
        :=
        {
        f
        :
        G
        →
        
          C
        
        }
      
    
    {\displaystyle L^{1}(G):=\{f:G\to \mathbb {C} \}}
  
は加法とスカラー乗法という演算を持つ
  
    
      
        
          C
        
      
    
    {\displaystyle \mathbb {C} }
  
ベクトル空間であるとすると、このベクトル空間は
  
    
      
        
          
            C
          
          
            
              |
            
            G
            
              |
            
          
        
        .
      
    
    {\displaystyle \mathbb {C} ^{|G|}.}
  
と同型である。2つの元
  
    
      
        f
        ,
        h
        ∈
        
          L
          
            1
          
        
        (
        G
        )
      
    
    {\displaystyle f,h\in L^{1}(G)}
  
の畳み込みは、次のように定義される。

これにより
  
    
      
        
          L
          
            1
          
        
        (
        G
        )
      
    
    {\displaystyle L^{1}(G)}
  
は代数となる。代数
  
    
      
        
          L
          
            1
          
        
        (
        G
        )
      
    
    {\displaystyle L^{1}(G)}
  
は畳み込み代数と呼ばれる。

畳み込み代数は自由であり、群の元によって添字付けられた基底を持つ。すなわち
  
    
      
        (
        
          δ
          
            s
          
        
        
          )
          
            s
            ∈
            G
          
        
        ,
      
    
    {\displaystyle (\delta _{s})_{s\in G},}
  
であり、ここで

畳み込みの性質を用いると、
  
    
      
        
          δ
          
            s
          
        
        ∗
        
          δ
          
            t
          
        
        =
        
          δ
          
            s
            t
          
        
        .
      
    
    {\displaystyle \delta _{s}*\delta _{t}=\delta _{st}.}
  
が得られる。

L
          
            1
          
        
        (
        G
        )
      
    
    {\displaystyle L^{1}(G)}
  
と
  
    
      
        
          C
        
        [
        G
        ]
        ,
      
    
    {\displaystyle \mathbb {C} [G],}
  
の間の写像を、基底上で
  
    
      
        
          δ
          
            s
          
        
        ↦
        
          e
          
            s
          
        
      
    
    {\displaystyle \delta _{s}\mapsto e_{s}}
  
と定義し、
  
    
      
        (
        
          δ
          
            s
          
        
        
          )
          
            s
            ∈
            G
          
        
      
    
    {\displaystyle (\delta _{s})_{s\in G}}
  
とし、それを線形に拡張することで定義する。明らかに、この写像は全単射である。上の式で示された2つの基底元の畳み込みを詳細に検討すると、
  
    
      
        
          L
          
            1
          
        
        (
        G
        )
      
    
    {\displaystyle L^{1}(G)}
  
における乗法が、
  
    
      
        
          C
        
        [
        G
        ]
        .
      
    
    {\displaystyle \mathbb {C} [G].}
  
における乗法に対応していることがわかる。したがって、畳み込み代数と群代数は代数として同型である。

は、
  
    
      
        
          L
          
            1
          
        
        (
        G
        )
      
    
    {\displaystyle L^{1}(G)}
  
を
  
    
      
        
          
          
            ∗
          
        
      
    
    {\displaystyle ^{*}}
  
代数に変える。
  
    
      
        
          δ
          
            s
          
          
            ∗
          
        
        =
        
          δ
          
            
              s
              
                −
                1
              
            
          
        
        .
      
    
    {\displaystyle \delta _{s}^{*}=\delta _{s^{-1}}.}
  
が成り立つ。

群
  
    
      
        G
      
    
    {\displaystyle G}
  
の表現
  
    
      
        (
        π
        ,
        
          V
          
            π
          
        
        )
      
    
    {\displaystyle (\pi ,V_{\pi })}
  
は、
  
    
      
        π
        (
        
          δ
          
            s
          
        
        )
        =
        π
        (
        s
        )
        .
      
    
    {\displaystyle \pi (\delta _{s})=\pi (s).}
  
によって
  
    
      
        
          
          
            ∗
          
        
      
    
    {\displaystyle ^{*}}
  
–代数準同型
  
    
      
        π
        :
        
          L
          
            1
          
        
        (
        G
        )
        →
        
          End
        
        (
        
          V
          
            π
          
        
        )
      
    
    {\displaystyle \pi :L^{1}(G)\to {\text{End}}(V_{\pi })}
  
に拡張される。乗法性は代数準同型の特性であるため、
  
    
      
        π
      
    
    {\displaystyle \pi }
  
は
  
    
      
        π
        (
        f
        ∗
        h
        )
        =
        π
        (
        f
        )
        π
        (
        h
        )
        .
      
    
    {\displaystyle \pi (f*h)=\pi (f)\pi (h).}
  
を満たす。
  
    
      
        π
      
    
    {\displaystyle \pi }
  
がユニタリ表現である場合、
  
    
      
        π
        (
        f
        
          )
          
            ∗
          
        
        =
        π
        (
        
          f
          
            ∗
          
        
        )
        .
      
    
    {\displaystyle \pi (f)^{*}=\pi (f^{*}).}
  
も得られる。ユニタリ表現の定義については、性質に関する章を参照されたい。その章では、（一般性を失うことなく）すべての線形表現はユニタリであると仮定できることを見る。

畳み込み代数を用いることで、群
  
    
      
        G
        .
      
    
    {\displaystyle G.}
  
上でフーリエ変換を実装できる。調和解析の分野では、以下の定義が
  
    
      
        
          R
        
        .
      
    
    {\displaystyle \mathbb {R} .}
  
上のフーリエ変換の定義と整合的であることが示されている。

ρ
        :
        G
        →
        
          GL
        
        (
        
          V
          
            ρ
          
        
        )
      
    
    {\displaystyle \rho :G\to {\text{GL}}(V_{\rho })}
  
を表現とし、
  
    
      
        f
        ∈
        
          L
          
            1
          
        
        (
        G
        )
      
    
    {\displaystyle f\in L^{1}(G)}
  
を
  
    
      
        
          C
        
      
    
    {\displaystyle \mathbb {C} }
  
値の
  
    
      
        G
      
    
    {\displaystyle G}
  
上の関数とする。
  
    
      
        f
      
    
    {\displaystyle f}
  
のフーリエ変換
  
    
      
        
          
            
              f
              ^
            
          
        
        (
        ρ
        )
        ∈
        
          End
        
        (
        
          V
          
            ρ
          
        
        )
      
    
    {\displaystyle {\hat {f}}(\rho )\in {\text{End}}(V_{\rho })}
  
は、次のように定義される。

この変換は
  
    
      
        
          
            
              
                f
                ∗
                g
              
              ^
            
          
        
        (
        ρ
        )
        =
        
          
            
              f
              ^
            
          
        
        (
        ρ
        )
        ⋅
        
          
            
              g
              ^
            
          
        
        (
        ρ
        )
        .
      
    
    {\displaystyle {\widehat {f*g}}(\rho )={\hat {f}}(\rho )\cdot {\hat {g}}(\rho ).}
  
を満たす。

### 表現間の写像

同じ群
  
    
      
        G
      
    
    {\displaystyle G}
  
の2つの表現
  
    
      
        (
        ρ
        ,
        
          V
          
            ρ
          
        
        )
        ,
        
        (
        τ
        ,
        
          V
          
            τ
          
        
        )
      
    
    {\displaystyle (\rho ,V_{\rho }),\,(\tau ,V_{\tau })}
  
の間の写像とは、すべての
  
    
      
        s
        ∈
        G
        .
      
    
    {\displaystyle s\in G.}
  
に対して
  
    
      
        τ
        (
        s
        )
        ∘
        T
        =
        T
        ∘
        ρ
        (
        s
        )
      
    
    {\displaystyle \tau (s)\circ T=T\circ \rho (s)}
  
が成り立つという性質を持つ線形写像
  
    
      
        T
        :
        
          V
          
            ρ
          
        
        →
        
          V
          
            τ
          
        
        ,
      
    
    {\displaystyle T:V_{\rho }\to V_{\tau },}
  
のことである。言い換えれば、すべての
  
    
      
        s
        ∈
        G
      
    
    {\displaystyle s\in G}
  
に対して以下の図式が可換となる。

このような写像は
  
    
      
        G
      
    
    {\displaystyle G}
  
線形、あるいは同変写像とも呼ばれる。
  
    
      
        T
      
    
    {\displaystyle T}
  
の核、像、および余核はデフォルトで定義される。同変写像の合成は再び同変写像となる。同変写像を射とする表現の圏が存在する。これらは再び
  
    
      
        G
      
    
    {\displaystyle G}
  
加群である。したがって、前節で述べた相関関係により、これらは
  
    
      
        G
      
    
    {\displaystyle G}
  
の表現を提供する。

## 既約表現とシューアの補題

ρ
        :
        G
        →
        
          GL
        
        (
        V
        )
      
    
    {\displaystyle \rho :G\to {\text{GL}}(V)}
  
を
  
    
      
        G
        .
      
    
    {\displaystyle G.}
  
の線形表現とする。
  
    
      
        W
      
    
    {\displaystyle W}
  
を
  
    
      
        V
        ,
      
    
    {\displaystyle V,}
  
の
  
    
      
        G
      
    
    {\displaystyle G}
  
不変部分空間とする。すなわち、すべての
  
    
      
        s
        ∈
        G
      
    
    {\displaystyle s\in G}
  
および
  
    
      
        w
        ∈
        W
      
    
    {\displaystyle w\in W}
  
に対して
  
    
      
        ρ
        (
        s
        )
        w
        ∈
        W
      
    
    {\displaystyle \rho (s)w\in W}
  
が成り立つものとする。制限
  
    
      
        ρ
        (
        s
        )
        
          
            |
          
          
            W
          
        
      
    
    {\displaystyle \rho (s)|_{W}}
  
は
  
    
      
        W
      
    
    {\displaystyle W}
  
からそれ自身への同型写像である。すべての
  
    
      
        s
        ,
        t
        ∈
        G
        ,
      
    
    {\displaystyle s,t\in G,}
  
に対して
  
    
      
        ρ
        (
        s
        )
        
          
            |
          
          
            W
          
        
        ∘
        ρ
        (
        t
        )
        
          
            |
          
          
            W
          
        
        =
        ρ
        (
        s
        t
        )
        
          
            |
          
          
            W
          
        
      
    
    {\displaystyle \rho (s)|_{W}\circ \rho (t)|_{W}=\rho (st)|_{W}}
  
が成り立つため、この構成は
  
    
      
        W
        .
      
    
    {\displaystyle W.}
  
における
  
    
      
        G
      
    
    {\displaystyle G}
  
の表現となる。これは
  
    
      
        V
        .
      
    
    {\displaystyle V.}
  
の部分表現と呼ばれる。任意の表現 V は少なくとも2つの部分表現を持つ。すなわち、0のみからなるものと、V 自身からなるものである。この表現は、これら2つしか部分表現を持たない場合、既約表現と呼ばれる。これら2つが唯一の部分表現である場合、既約表現と呼ばれる。一部の著者は、これらが群代数
  
    
      
        
          C
        
        [
        G
        ]
      
    
    {\displaystyle \mathbb {C} [G]}
  
上の単純加群と正確に一致するため、これらの表現を単純表現と呼ぶこともある。

シューアの補題は、既約表現間の写像に対して強力な制約を課す。
  
    
      
        
          ρ
          
            1
          
        
        :
        G
        →
        
          GL
        
        (
        
          V
          
            1
          
        
        )
      
    
    {\displaystyle \rho _{1}:G\to {\text{GL}}(V_{1})}
  
と
  
    
      
        
          ρ
          
            2
          
        
        :
        G
        →
        
          GL
        
        (
        
          V
          
            2
          
        
        )
      
    
    {\displaystyle \rho _{2}:G\to {\text{GL}}(V_{2})}
  
がいずれも既約であり、
  
    
      
        F
        :
        
          V
          
            1
          
        
        →
        
          V
          
            2
          
        
      
    
    {\displaystyle F:V_{1}\to V_{2}}
  
が線形写像であって、すべての
  
    
      
        
          ρ
          
            2
          
        
        (
        s
        )
        ∘
        F
        =
        F
        ∘
        
          ρ
          
            1
          
        
        (
        s
        )
      
    
    {\displaystyle \rho _{2}(s)\circ F=F\circ \rho _{1}(s)}
  
に対して
  
    
      
        s
        ∈
        G
        .
      
    
    {\displaystyle s\in G.}
  
が成り立つならば、次のような二分法が存在する。

- V
          
            1
          
        
        =
        
          V
          
            2
          
        
      
    
    {\displaystyle V_{1}=V_{2}}
  
と
  
    
      
        
          ρ
          
            1
          
        
        =
        
          ρ
          
            2
          
        
        ,
      
    
    {\displaystyle \rho _{1}=\rho _{2},}
  
が同型である場合、
  
    
      
        F
      
    
    {\displaystyle F}
  
は相似変換（すなわち、ある
  
    
      
        λ
        ∈
        
          C
        
      
    
    {\displaystyle \lambda \in \mathbb {C} }
  
に対して
  
    
      
        F
        =
        λ
        
          Id
        
      
    
    {\displaystyle F=\lambda {\text{Id}}}
  
）である。より一般に、
  
    
      
        
          ρ
          
            1
          
        
      
    
    {\displaystyle \rho _{1}}
  
と
  
    
      
        
          ρ
          
            2
          
        
      
    
    {\displaystyle \rho _{2}}
  
が同型であれば、G線形写像の空間は1次元となる。
- そうでなければ、2つの表現が同型でない場合、Fは0でなければならない。[3]

## 性質

2つの表現
  
    
      
        (
        ρ
        ,
        
          V
          
            ρ
          
        
        )
        ,
        (
        π
        ,
        
          V
          
            π
          
        
        )
      
    
    {\displaystyle (\rho ,V_{\rho }),(\pi ,V_{\pi })}
  
は、以下が存在する場合に同値または同型と呼ばれる。
  
    
      
        G
      
    
    {\displaystyle G}
  
線形ベクトル空間の同型写像が表現空間の間に存在する場合である。言い換えれば、全単射な線形写像が存在するとき、それらは同型である。
  
    
      
        T
        :
        
          V
          
            ρ
          
        
        →
        
          V
          
            π
          
        
        ,
      
    
    {\displaystyle T:V_{\rho }\to V_{\pi },}
  
であって、すべての
  
    
      
        T
        ∘
        ρ
        (
        s
        )
        =
        π
        (
        s
        )
        ∘
        T
      
    
    {\displaystyle T\circ \rho (s)=\pi (s)\circ T}
  
に対して
  
    
      
        s
        ∈
        G
        .
      
    
    {\displaystyle s\in G.}
  
が成り立つことである。特に、同値な表現は同じ次数を持つ。

表現
  
    
      
        (
        π
        ,
        
          V
          
            π
          
        
        )
      
    
    {\displaystyle (\pi ,V_{\pi })}
  
は、
  
    
      
        π
      
    
    {\displaystyle \pi }
  
が 単射であるとき、忠実であると呼ばれる。この場合、
  
    
      
        π
      
    
    {\displaystyle \pi }
  
は
  
    
      
        G
      
    
    {\displaystyle G}
  
と像
  
    
      
        π
        (
        G
        )
        .
      
    
    {\displaystyle \pi (G).}
  
との間の同型を誘導する。後者は
  
    
      
        
          GL
        
        (
        
          V
          
            π
          
        
        )
        ,
      
    
    {\displaystyle {\text{GL}}(V_{\pi }),}
  
の部分群であるため、
  
    
      
        π
      
    
    {\displaystyle \pi }
  
を介して
  
    
      
        G
      
    
    {\displaystyle G}
  
を
  
    
      
        
          Aut
        
        (
        
          V
          
            π
          
        
        )
        .
      
    
    {\displaystyle {\text{Aut}}(V_{\pi }).}
  
の部分群とみなすことができる。

値域と定義域の両方を制限することができる。

G
        .
      
    
    {\displaystyle G.}
  
の部分群を
  
    
      
        H
      
    
    {\displaystyle H}
  
とする。
  
    
      
        G
        .
      
    
    {\displaystyle G.}
  
の線形表現を
  
    
      
        ρ
      
    
    {\displaystyle \rho }
  
とする。
  
    
      
        ρ
      
    
    {\displaystyle \rho }
  
の
  
    
      
        H
        .
      
    
    {\displaystyle H.}
  
への制限を
  
    
      
        
          
            Res
          
          
            H
          
        
        (
        ρ
        )
      
    
    {\displaystyle {\text{Res}}_{H}(\rho )}
  
と表記する。

混同の恐れがない場合は、単に
  
    
      
        
          Res
        
        (
        ρ
        )
      
    
    {\displaystyle {\text{Res}}(\rho )}
  
、あるいは短く
  
    
      
        
          Res
        
        ρ
        .
      
    
    {\displaystyle {\text{Res}}\rho .}
  
と表記することもある。

記法
  
    
      
        
          
            Res
          
          
            H
          
        
        (
        V
        )
      
    
    {\displaystyle {\text{Res}}_{H}(V)}
  
、あるいは短く
  
    
      
        
          Res
        
        (
        V
        )
      
    
    {\displaystyle {\text{Res}}(V)}
  
は、
  
    
      
        G
      
    
    {\displaystyle G}
  
の表現
  
    
      
        V
      
    
    {\displaystyle V}
  
の
  
    
      
        H
        .
      
    
    {\displaystyle H.}
  
への制限を表すためにも用いられる。

G
        .
      
    
    {\displaystyle G.}
  
上の関数を
  
    
      
        f
      
    
    {\displaystyle f}
  
とする。部分群
  
    
      
        H
        .
      
    
    {\displaystyle H.}
  
への制限を
  
    
      
        
          
            Res
          
          
            H
          
        
        (
        f
        )
      
    
    {\displaystyle {\text{Res}}_{H}(f)}
  
、あるいは短く
  
    
      
        
          Res
        
        (
        f
        )
      
    
    {\displaystyle {\text{Res}}(f)}
  
と書く。

群
  
    
      
        G
      
    
    {\displaystyle G}
  
の既約表現の数（あるいは対応して単純
  
    
      
        
          C
        
        [
        G
        ]
      
    
    {\displaystyle \mathbb {C} [G]}
  
加群の数）は、
  
    
      
        G
        .
      
    
    {\displaystyle G.}
  
の共役類の数に等しいことが証明できる。

表現が既約表現の直和として書けるとき、その表現は半単純または完全可約であると呼ばれる。これは半単純代数に対する対応する定義と類似している。

表現の直和の定義については、表現の直和の節を参照のこと。

表現が互いに同型な既約表現の直和である場合、その表現は等型であると呼ばれる。

(
        ρ
        ,
        
          V
          
            ρ
          
        
        )
      
    
    {\displaystyle (\rho ,V_{\rho })}
  
を群
  
    
      
        G
        .
      
    
    {\displaystyle G.}
  
の与えられた表現とする。
  
    
      
        τ
      
    
    {\displaystyle \tau }
  
を
  
    
      
        G
        .
      
    
    {\displaystyle G.}
  
の既約表現とする。
  
    
      
        G
      
    
    {\displaystyle G}
  
の
  
    
      
        τ
      
    
    {\displaystyle \tau }
  
–アイソタイプ
  
    
      
        
          V
          
            ρ
          
        
        (
        τ
        )
      
    
    {\displaystyle V_{\rho }(\tau )}
  
は、
  
    
      
        τ
        .
      
    
    {\displaystyle \tau .}
  
と同型な
  
    
      
        V
      
    
    {\displaystyle V}
  
のすべての既約部分表現の和として定義される。

C
        
      
    
    {\displaystyle \mathbb {C} }
  
上のすべてのベクトル空間には 内積を与えることができる。内積を備えたベクトル空間における群
  
    
      
        G
      
    
    {\displaystyle G}
  
の表現
  
    
      
        ρ
      
    
    {\displaystyle \rho }
  
は、すべての
  
    
      
        s
        ∈
        G
        .
      
    
    {\displaystyle s\in G.}
  
に対して
  
    
      
        ρ
        (
        s
        )
      
    
    {\displaystyle \rho (s)}
  
が ユニタリである場合、ユニタリ表現と呼ばれる。これは特に、すべての
  
    
      
        ρ
        (
        s
        )
      
    
    {\displaystyle \rho (s)}
  
が 対角化可能であることを意味する。詳細については、ユニタリ表現に関する記事を参照のこと。

表現が与えられた内積に関してユニタリであるとは、その内積が
  
    
      
        G
        ,
      
    
    {\displaystyle G,}
  
の誘導された演算に関して不変であること、すなわちすべての
  
    
      
        v
        ,
        u
        ∈
        
          V
          
            ρ
          
        
        ,
        s
        ∈
        G
        .
      
    
    {\displaystyle v,u\in V_{\rho },s\in G.}
  
に対して
  
    
      
        (
        v
        
          |
        
        u
        )
        =
        (
        ρ
        (
        s
        )
        v
        
          |
        
        ρ
        (
        s
        )
        u
        )
      
    
    {\displaystyle (v|u)=(\rho (s)v|\rho (s)u)}
  
が成り立つことと同値である。

与えられた内積
  
    
      
        (
        ⋅
        
          |
        
        ⋅
        )
      
    
    {\displaystyle (\cdot |\cdot )}
  
は、以下を交換することで不変内積に置き換えることができる。
  
    
      
        (
        v
        
          |
        
        u
        )
      
    
    {\displaystyle (v|u)}
  
と

したがって、一般性を失うことなく、今後考察するすべての表現はユニタリであると仮定できる。

例。
  
    
      
        6
      
    
    {\displaystyle 6}
  
次（位数）の二面体群を
  
    
      
        G
        =
        
          D
          
            6
          
        
        =
        {
        
          id
        
        ,
        μ
        ,
        
          μ
          
            2
          
        
        ,
        ν
        ,
        μ
        ν
        ,
        
          μ
          
            2
          
        
        ν
        }
      
    
    {\displaystyle G=D_{6}=\{{\text{id}},\mu ,\mu ^{2},\nu ,\mu \nu ,\mu ^{2}\nu \}}
  
とし、
  
    
      
        
          ord
        
        (
        ν
        )
        =
        2
        ,
        
          ord
        
        (
        μ
        )
        =
        3
      
    
    {\displaystyle {\text{ord}}(\nu )=2,{\text{ord}}(\mu )=3}
  
および
  
    
      
        ν
        μ
        ν
        =
        
          μ
          
            2
          
        
        .
      
    
    {\displaystyle \nu \mu \nu =\mu ^{2}.}
  
の性質を満たす
  
    
      
        μ
        ,
        ν
      
    
    {\displaystyle \mu ,\nu }
  
によって生成されるとする。
  
    
      
        
          D
          
            6
          
        
      
    
    {\displaystyle D_{6}}
  
の線形表現
  
    
      
        ρ
        :
        
          D
          
            6
          
        
        →
        
          
            GL
          
          
            3
          
        
        (
        
          C
        
        )
      
    
    {\displaystyle \rho :D_{6}\to {\text{GL}}_{3}(\mathbb {C} )}
  
を、生成元に対して次のように定義する。

この表現は忠実である。部分空間
  
    
      
        
          C
        
        
          e
          
            2
          
        
      
    
    {\displaystyle \mathbb {C} e_{2}}
  
は
  
    
      
        
          D
          
            6
          
        
      
    
    {\displaystyle D_{6}}
  
不変部分空間である。したがって、
  
    
      
        ν
        ↦
        −
        1
        ,
        μ
        ↦
        1.
      
    
    {\displaystyle \nu \mapsto -1,\mu \mapsto 1.}
  
を満たす非自明な部分表現
  
    
      
        ρ
        
          
            |
          
          
            
              C
            
            
              e
              
                2
              
            
          
        
        :
        
          D
          
            6
          
        
        →
        
          
            C
          
          
            ×
          
        
      
    
    {\displaystyle \rho |_{\mathbb {C} e_{2}}:D_{6}\to \mathbb {C} ^{\times }}
  
が存在する。ゆえに、この表現は既約ではない。前述の部分表現は次数1であり、既約である。
  
    
      
        
          C
        
        
          e
          
            2
          
        
      
    
    {\displaystyle \mathbb {C} e_{2}}
  
の補空間もまた
  
    
      
        
          D
          
            6
          
        
      
    
    {\displaystyle D_{6}}
  
不変である。したがって、
  
    
      
        ρ
        
          
            |
          
          
            
              C
            
            
              e
              
                1
              
            
            ⊕
            
              C
            
            
              e
              
                3
              
            
          
        
      
    
    {\displaystyle \rho |_{\mathbb {C} e_{1}\oplus \mathbb {C} e_{3}}}
  
という部分表現が得られる。

この部分表現もまた既約である。すなわち、元の表現は完全可約である。

両方の部分表現はアイソタイプであり、
  
    
      
        ρ
        .
      
    
    {\displaystyle \rho .}
  
の唯一の非零アイソタイプである。

ρ
        (
        μ
        )
      
    
    {\displaystyle \rho (\mu )}
  
および
  
    
      
        ρ
        (
        ν
        )
      
    
    {\displaystyle \rho (\nu )}
  
がユニタリであるため、表現
  
    
      
        ρ
      
    
    {\displaystyle \rho }
  
は
  
    
      
        
          
            C
          
          
            3
          
        
        ,
      
    
    {\displaystyle \mathbb {C} ^{3},}
  
上の標準内積に関してユニタリである。

T
        :
        
          
            C
          
          
            3
          
        
        →
        
          
            C
          
          
            3
          
        
      
    
    {\displaystyle T:\mathbb {C} ^{3}\to \mathbb {C} ^{3}}
  
を任意のベクトル空間同型写像とする。このとき、すべての
  
    
      
        s
        ∈
        
          D
          
            6
          
        
        ,
      
    
    {\displaystyle s\in D_{6},}
  
に対して方程式
  
    
      
        η
        (
        s
        )
        :=
        T
        ∘
        ρ
        (
        s
        )
        ∘
        
          T
          
            −
            1
          
        
      
    
    {\displaystyle \eta (s):=T\circ \rho (s)\circ T^{-1}}
  
で定義される
  
    
      
        η
        :
        
          D
          
            6
          
        
        →
        
          
            GL
          
          
            3
          
        
        (
        
          C
        
        )
        ,
      
    
    {\displaystyle \eta :D_{6}\to {\text{GL}}_{3}(\mathbb {C} ),}
  
は、
  
    
      
        ρ
        .
      
    
    {\displaystyle \rho .}
  
と同型な表現である。

表現の定義域を部分群に制限することにより、例えば
  
    
      
        H
        =
        {
        
          id
        
        ,
        μ
        ,
        
          μ
          
            2
          
        
        }
        ,
      
    
    {\displaystyle H=\{{\text{id}},\mu ,\mu ^{2}\},}
  
表現が得られる。
  
    
      
        
          
            Res
          
          
            H
          
        
        (
        ρ
        )
        .
      
    
    {\displaystyle {\text{Res}}_{H}(\rho ).}
  
この表現は、像によって定義される。
  
    
      
        ρ
        (
        μ
        )
        ,
      
    
    {\displaystyle \rho (\mu ),}
  
その明示的な形式は上記のとおりである。

## 構成

### 双対表現

ρ
        :
        G
        →
        
          GL
        
        (
        V
        )
      
    
    {\displaystyle \rho :G\to {\text{GL}}(V)}
  
を与えられた表現とする。双対表現または反傾表現
  
    
      
        
          ρ
          
            ∗
          
        
        :
        G
        →
        
          GL
        
        (
        
          V
          
            ∗
          
        
        )
      
    
    {\displaystyle \rho ^{*}:G\to {\text{GL}}(V^{*})}
  
は、
  
    
      
        V
        .
      
    
    {\displaystyle V.}
  
の双対ベクトル空間における
  
    
      
        G
      
    
    {\displaystyle G}
  
の表現である。これは以下の性質によって定義される。

V
          
            ∗
          
        
      
    
    {\displaystyle V^{*}}
  
と
  
    
      
        V
      
    
    {\displaystyle V}
  
の間の自然なペアリング
  
    
      
        ⟨
        α
        ,
        v
        ⟩
        :=
        α
        (
        v
        )
      
    
    {\displaystyle \langle \alpha ,v\rangle :=\alpha (v)}
  
に関して、上記の定義は次の方程式を与える。

例については、このトピックのメインページである双対表現を参照のこと。

### 表現の直和

(
        
          ρ
          
            1
          
        
        ,
        
          V
          
            1
          
        
        )
      
    
    {\displaystyle (\rho _{1},V_{1})}
  
および
  
    
      
        (
        
          ρ
          
            2
          
        
        ,
        
          V
          
            2
          
        
        )
      
    
    {\displaystyle (\rho _{2},V_{2})}
  
をそれぞれ
  
    
      
        
          G
          
            1
          
        
      
    
    {\displaystyle G_{1}}
  
および
  
    
      
        
          G
          
            2
          
        
        ,
      
    
    {\displaystyle G_{2},}
  
の表現とする。これらの表現の直和は線形表現であり、次のように定義される。

ρ
          
            1
          
        
        ,
        
          ρ
          
            2
          
        
      
    
    {\displaystyle \rho _{1},\rho _{2}}
  
を同一の群
  
    
      
        G
        .
      
    
    {\displaystyle G.}
  
の表現とする。簡潔にするため、これらの表現の直和は
  
    
      
        G
        ,
      
    
    {\displaystyle G,}
  
の表現として定義される。すなわち、
  
    
      
        G
      
    
    {\displaystyle G}
  
を
  
    
      
        G
        ×
        G
        .
      
    
    {\displaystyle G\times G.}
  
の対角部分群とみなすことにより、
  
    
      
        
          ρ
          
            1
          
        
        ⊕
        
          ρ
          
            2
          
        
        :
        G
        →
        
          GL
        
        (
        
          V
          
            1
          
        
        ⊕
        
          V
          
            2
          
        
        )
        ,
      
    
    {\displaystyle \rho _{1}\oplus \rho _{2}:G\to {\text{GL}}(V_{1}\oplus V_{2}),}
  
として与えられる。

例。（ここで
  
    
      
        i
      
    
    {\displaystyle i}
  
および
  
    
      
        ω
      
    
    {\displaystyle \omega }
  
はそれぞれ虚数単位および1の原始3乗根である）とする。

生成元の像を考慮すれば十分であるため、次が成り立つ。

### 表現のテンソル積

ρ
          
            1
          
        
        :
        
          G
          
            1
          
        
        →
        
          GL
        
        (
        
          V
          
            1
          
        
        )
        ,
        
          ρ
          
            2
          
        
        :
        
          G
          
            2
          
        
        →
        
          GL
        
        (
        
          V
          
            2
          
        
        )
      
    
    {\displaystyle \rho _{1}:G_{1}\to {\text{GL}}(V_{1}),\rho _{2}:G_{2}\to {\text{GL}}(V_{2})}
  
を線形表現とする。
  
    
      
        
          V
          
            1
          
        
      
    
    {\displaystyle V_{1}}
  
と
  
    
      
        
          V
          
            2
          
        
      
    
    {\displaystyle V_{2}}
  
のテンソル積への線形表現
  
    
      
        
          ρ
          
            1
          
        
        ⊗
        
          ρ
          
            2
          
        
        :
        
          G
          
            1
          
        
        ×
        
          G
          
            2
          
        
        →
        
          GL
        
        (
        
          V
          
            1
          
        
        ⊗
        
          V
          
            2
          
        
        )
      
    
    {\displaystyle \rho _{1}\otimes \rho _{2}:G_{1}\times G_{2}\to {\text{GL}}(V_{1}\otimes V_{2})}
  
を
  
    
      
        
          ρ
          
            1
          
        
        ⊗
        
          ρ
          
            2
          
        
        (
        
          s
          
            1
          
        
        ,
        
          s
          
            2
          
        
        )
        =
        
          ρ
          
            1
          
        
        (
        
          s
          
            1
          
        
        )
        ⊗
        
          ρ
          
            2
          
        
        (
        
          s
          
            2
          
        
        )
        ,
      
    
    {\displaystyle \rho _{1}\otimes \rho _{2}(s_{1},s_{2})=\rho _{1}(s_{1})\otimes \rho _{2}(s_{2}),}
  
によって定義する。ここで
  
    
      
        
          s
          
            1
          
        
        ∈
        
          G
          
            1
          
        
        ,
        
          s
          
            2
          
        
        ∈
        
          G
          
            2
          
        
        .
      
    
    {\displaystyle s_{1}\in G_{1},s_{2}\in G_{2}.}
  
である。この表現は、表現
  
    
      
        
          ρ
          
            1
          
        
      
    
    {\displaystyle \rho _{1}}
  
と
  
    
      
        
          ρ
          
            2
          
        
        .
      
    
    {\displaystyle \rho _{2}.}
  
の外テンソル積と呼ばれる。その存在と一意性は、テンソル積の性質の帰結である。

例。直和に対して提供された例を再検討する。

C
          
          
            2
          
        
        ⊗
        
          
            C
          
          
            3
          
        
        ≅
        
          
            C
          
          
            6
          
        
      
    
    {\displaystyle \mathbb {C} ^{2}\otimes \mathbb {C} ^{3}\cong \mathbb {C} ^{6}}
  
の標準基底を用いると、生成元について次が得られる。

注記。直和とテンソル積は次数が異なるため、異なる表現であることに注意せよ。

ρ
          
            1
          
        
        :
        G
        →
        
          GL
        
        (
        
          V
          
            1
          
        
        )
        ,
        
          ρ
          
            2
          
        
        :
        G
        →
        
          GL
        
        (
        
          V
          
            2
          
        
        )
      
    
    {\displaystyle \rho _{1}:G\to {\text{GL}}(V_{1}),\rho _{2}:G\to {\text{GL}}(V_{2})}
  
を同一群の2つの線形表現とする。
  
    
      
        s
      
    
    {\displaystyle s}
  
を
  
    
      
        G
        .
      
    
    {\displaystyle G.}
  
の元とする。このとき
  
    
      
        ρ
        (
        s
        )
        ∈
        
          GL
        
        (
        
          V
          
            1
          
        
        ⊗
        
          V
          
            2
          
        
        )
      
    
    {\displaystyle \rho (s)\in {\text{GL}}(V_{1}\otimes V_{2})}
  
は
  
    
      
        
          v
          
            1
          
        
        ∈
        
          V
          
            1
          
        
        ,
        
          v
          
            2
          
        
        ∈
        
          V
          
            2
          
        
        ,
      
    
    {\displaystyle v_{1}\in V_{1},v_{2}\in V_{2},}
  
に対して
  
    
      
        ρ
        (
        s
        )
        (
        
          v
          
            1
          
        
        ⊗
        
          v
          
            2
          
        
        )
        =
        
          ρ
          
            1
          
        
        (
        s
        )
        
          v
          
            1
          
        
        ⊗
        
          ρ
          
            2
          
        
        (
        s
        )
        
          v
          
            2
          
        
        ,
      
    
    {\displaystyle \rho (s)(v_{1}\otimes v_{2})=\rho _{1}(s)v_{1}\otimes \rho _{2}(s)v_{2},}
  
によって定義され、
  
    
      
        ρ
        (
        s
        )
        =
        
          ρ
          
            1
          
        
        (
        s
        )
        ⊗
        
          ρ
          
            2
          
        
        (
        s
        )
        .
      
    
    {\displaystyle \rho (s)=\rho _{1}(s)\otimes \rho _{2}(s).}
  
と書く。このとき、写像
  
    
      
        s
        ↦
        ρ
        (
        s
        )
      
    
    {\displaystyle s\mapsto \rho (s)}
  
は
  
    
      
        G
        ,
      
    
    {\displaystyle G,}
  
の線形表現を定義し、これは与えられた表現のテンソル積とも呼ばれる。

これら2つのケースは厳密に区別されなければならない。第1のケースは、群積から対応する表現空間のテンソル積への表現である。第2のケースは、群
  
    
      
        G
      
    
    {\displaystyle G}
  
からこの単一の群の2つの表現空間のテンソル積への表現である。しかし、この後者のケースは、対角部分群に注目することで第1のケースの特殊な場合とみなすことができる。
  
    
      
        G
        ×
        G
        .
      
    
    {\displaystyle G\times G.}
  
この定義は有限回繰り返すことができる。

V
      
    
    {\displaystyle V}
  
と
  
    
      
        W
      
    
    {\displaystyle W}
  
を群
  
    
      
        G
        .
      
    
    {\displaystyle G.}
  
の表現とする。このとき
  
    
      
        
          Hom
        
        (
        V
        ,
        W
        )
      
    
    {\displaystyle {\text{Hom}}(V,W)}
  
は次の恒等式により表現となる：
  
    
      
        
          Hom
        
        (
        V
        ,
        W
        )
        =
        
          V
          
            ∗
          
        
        ⊗
        W
      
    
    {\displaystyle {\text{Hom}}(V,W)=V^{*}\otimes W}
  
。
  
    
      
        B
        ∈
        
          Hom
        
        (
        V
        ,
        W
        )
      
    
    {\displaystyle B\in {\text{Hom}}(V,W)}
  
とし、
  
    
      
        
          Hom
        
        (
        V
        ,
        W
        )
        .
      
    
    {\displaystyle {\text{Hom}}(V,W).}
  
上の表現を
  
    
      
        ρ
      
    
    {\displaystyle \rho }
  
とする。
  
    
      
        V
      
    
    {\displaystyle V}
  
上の表現を
  
    
      
        
          ρ
          
            V
          
        
      
    
    {\displaystyle \rho _{V}}
  
とし、
  
    
      
        W
        .
      
    
    {\displaystyle W.}
  
上の表現を
  
    
      
        
          ρ
          
            W
          
        
      
    
    {\displaystyle \rho _{W}}
  
とする。このとき、上記の恒等式は以下の結果を導く：

#### 対称積および交代積

ρ
        :
        G
        →
        V
        ⊗
        V
      
    
    {\displaystyle \rho :G\to V\otimes V}
  
を
  
    
      
        G
        .
      
    
    {\displaystyle G.}
  
の線形表現とする。
  
    
      
        (
        
          e
          
            k
          
        
        )
      
    
    {\displaystyle (e_{k})}
  
を
  
    
      
        V
        .
      
    
    {\displaystyle V.}
  
の基底とする。
  
    
      
        ϑ
        (
        
          e
          
            k
          
        
        ⊗
        
          e
          
            j
          
        
        )
        =
        
          e
          
            j
          
        
        ⊗
        
          e
          
            k
          
        
      
    
    {\displaystyle \vartheta (e_{k}\otimes e_{j})=e_{j}\otimes e_{k}}
  
を線形に拡張することによって
  
    
      
        ϑ
        :
        V
        ⊗
        V
        →
        V
        ⊗
        V
      
    
    {\displaystyle \vartheta :V\otimes V\to V\otimes V}
  
を定義する。このとき
  
    
      
        
          ϑ
          
            2
          
        
        =
        1
      
    
    {\displaystyle \vartheta ^{2}=1}
  
が成り立ち、したがって
  
    
      
        V
        ⊗
        V
      
    
    {\displaystyle V\otimes V}
  
は
  
    
      
        V
        ⊗
        V
        =
        
          
            Sym
          
          
            2
          
        
        (
        V
        )
        ⊕
        
          
            Alt
          
          
            2
          
        
        (
        V
        )
        ,
      
    
    {\displaystyle V\otimes V={\text{Sym}}^{2}(V)\oplus {\text{Alt}}^{2}(V),}
  
に分解される。ここで

これらの部分空間は
  
    
      
        G
      
    
    {\displaystyle G}
  
不変であり、それによって対称平方および交代平方と呼ばれる部分表現をそれぞれ定義する。これらの部分表現は、
  
    
      
        
          V
          
            ⊗
            m
          
        
        ,
      
    
    {\displaystyle V^{\otimes m},}
  
においても定義されるが、この場合、それらはウェッジ積
  
    
      
        
          ⋀
          
            m
          
        
        V
      
    
    {\displaystyle \bigwedge ^{m}V}
  
および対称積と表記される。
  
    
      
        
          
            Sym
          
          
            m
          
        
        (
        V
        )
        .
      
    
    {\displaystyle {\text{Sym}}^{m}(V).}
  
の場合、
  
    
      
        m
        >
        2
        ,
      
    
    {\displaystyle m>2,}
  
ベクトル空間
  
    
      
        
          V
          
            ⊗
            m
          
        
      
    
    {\displaystyle V^{\otimes m}}
  
は、一般にこれら二つの積の直和とは等しくない。

## 分解

表現をより容易に理解するためには、表現空間をより単純な部分表現の直和に分解することが望ましい。有限群については、以下の結果で示されるように、これが達成可能である。より詳細な説明と証明については、 [1]および [2]を参照のこと。

部分表現とその補空間は、表現を一意に決定する。

以下の定理は、コンパクト群（したがって有限群も含む）の表現に関する非常に美しい結果を提供するものであるため、より一般的な形で提示する。

あるいは
  
    
      
        K
        [
        G
        ]
      
    
    {\displaystyle K[G]}
  
加群の言葉で言えば、もし
  
    
      
        
          char
        
        (
        K
        )
        =
        0
        ,
      
    
    {\displaystyle {\text{char}}(K)=0,}
  
群環
  
    
      
        K
        [
        G
        ]
      
    
    {\displaystyle K[G]}
  
が半単純、すなわち単純環の直和であるならば、

この分解は一意ではないことに注意せよ。しかし、この分解において与えられた既約表現と同型な部分表現が何回現れるかという数は、分解の選択によらず一定である。

一意な分解を得るためには、互いに同型なすべての既約部分表現を組み合わせる必要がある。つまり、表現空間はそのアイソタイプ（同型類）の直和に分解される。この分解は一意に決定され、標準分解と呼ばれる。

(
        
          τ
          
            j
          
        
        
          )
          
            j
            ∈
            I
          
        
      
    
    {\displaystyle (\tau _{j})_{j\in I}}
  
を群のすべての既約表現の集合とする
  
    
      
        G
      
    
    {\displaystyle G}
  
（同型を除いて）。
  
    
      
        V
      
    
    {\displaystyle V}
  
をの表現とし、
  
    
      
        G
      
    
    {\displaystyle G}
  
とし、
  
    
      
        {
        V
        (
        
          τ
          
            j
          
        
        )
        
          |
        
        j
        ∈
        I
        }
      
    
    {\displaystyle \{V(\tau _{j})|j\in I\}}
  
をのすべてのアイソタイプの集合とする。
  
    
      
        V
        .
      
    
    {\displaystyle V.}
  
標準分解に対応する射影
  
    
      
        
          p
          
            j
          
        
        :
        V
        →
        V
        (
        
          τ
          
            j
          
        
        )
      
    
    {\displaystyle p_{j}:V\to V(\tau _{j})}
  
は、次のように与えられる。

ここで
  
    
      
        
          n
          
            j
          
        
        =
        dim
        ⁡
        (
        
          τ
          
            j
          
        
        )
        ,
      
    
    {\displaystyle n_{j}=\dim(\tau _{j}),}
  

  
    
      
        g
        =
        
          ord
        
        (
        G
        )
      
    
    {\displaystyle g={\text{ord}}(G)}
  
であり、
  
    
      
        
          χ
          
            
              τ
              
                j
              
            
          
        
      
    
    {\displaystyle \chi _{\tau _{j}}}
  
は
  
    
      
        
          τ
          
            j
          
        
        .
      
    
    {\displaystyle \tau _{j}.}
  
に属する指標である。

以下では、自明表現に対するアイソタイプを決定する方法を示す。

定義（射影公式）。群の任意の表現
  
    
      
        (
        ρ
        ,
        V
        )
      
    
    {\displaystyle (\rho ,V)}
  
に対して、
  
    
      
        G
      
    
    {\displaystyle G}
  
次のように定義する。

一般に、
  
    
      
        ρ
        (
        s
        )
        :
        V
        →
        V
      
    
    {\displaystyle \rho (s):V\to V}
  
は
  
    
      
        G
      
    
    {\displaystyle G}
  
線形ではない。我々は次のように定義する。

したがって
  
    
      
        P
      
    
    {\displaystyle P}
  
は
  
    
      
        G
      
    
    {\displaystyle G}
  
線形写像である。なぜならば

この命題により、与えられた表現の自明な部分表現に対するアイソタイプを明示的に決定することができる。

自明な表現が
  
    
      
        V
      
    
    {\displaystyle V}
  
に何回現れるかは
  
    
      
        
          Tr
        
        (
        P
        )
        .
      
    
    {\displaystyle {\text{Tr}}(P).}
  
によって与えられる。この結果は、射影の固有値が
  
    
      
        0
      
    
    {\displaystyle 0}
  
または
  
    
      
        1
      
    
    {\displaystyle 1}
  
のいずれかであり、固有値
  
    
      
        1
      
    
    {\displaystyle 1}
  
に対応する固有空間がその射影の像であるという事実から導かれる。射影のトレースはすべての固有値の和であるため、以下の結果が得られる。

ここで
  
    
      
        V
        (
        1
        )
      
    
    {\displaystyle V(1)}
  
は自明な表現のアイソタイプを表す。

V
          
            π
          
        
      
    
    {\displaystyle V_{\pi }}
  
を
  
    
      
        G
        .
      
    
    {\displaystyle G.}
  
の非自明な既約表現とする。そのとき、自明な表現に対するアイソタイプ
  
    
      
        π
      
    
    {\displaystyle \pi }
  
は零空間となる。つまり、以下の等式が成り立つ。

e
          
            1
          
        
        ,
        .
        .
        .
        ,
        
          e
          
            n
          
        
      
    
    {\displaystyle e_{1},...,e_{n}}
  
を
  
    
      
        
          V
          
            π
          
        
        .
      
    
    {\displaystyle V_{\pi }.}
  
の正規直交基底とする。そのとき、次が成り立つ。

したがって、非自明な既約表現
  
    
      
        V
      
    
    {\displaystyle V}
  
に対して以下が有効である。

例
  
    
      
        G
        =
        
          Per
        
        (
        3
        )
      
    
    {\displaystyle G={\text{Per}}(3)}
  
を3要素の置換群とする。
  
    
      
        ρ
        :
        
          Per
        
        (
        3
        )
        →
        
          
            GL
          
          
            5
          
        
        (
        
          C
        
        )
      
    
    {\displaystyle \rho :{\text{Per}}(3)\to {\text{GL}}_{5}(\mathbb {C} )}
  
を
  
    
      
        
          Per
        
        (
        3
        )
      
    
    {\displaystyle {\text{Per}}(3)}
  
の線形表現とし、生成元に対して次のように定義する。

この表現は、一見すると
  
    
      
        
          Per
        
        (
        3
        )
        ,
      
    
    {\displaystyle {\text{Per}}(3),}
  
の左正則表現（以下
  
    
      
        π
      
    
    {\displaystyle \pi }
  
と記す）と、表現
  
    
      
        η
        :
        
          Per
        
        (
        3
        )
        →
        
          
            GL
          
          
            2
          
        
        (
        
          C
        
        )
      
    
    {\displaystyle \eta :{\text{Per}}(3)\to {\text{GL}}_{2}(\mathbb {C} )}
  
とに分解できる。

次章で扱う既約性判定法を用いると、
  
    
      
        η
      
    
    {\displaystyle \eta }
  
は既約であるが
  
    
      
        π
      
    
    {\displaystyle \pi }
  
はそうではないことがわかる。これは（後述の「内積と指標」における内積の定義に基づき）
  
    
      
        (
        η
        
          |
        
        η
        )
        =
        1
        ,
        (
        π
        
          |
        
        π
        )
        =
        2.
      
    
    {\displaystyle (\eta |\eta )=1,(\pi |\pi )=2.}
  
となるためである。

C
        
        (
        
          e
          
            1
          
        
        +
        
          e
          
            2
          
        
        +
        
          e
          
            3
          
        
        )
      
    
    {\displaystyle \mathbb {C} (e_{1}+e_{2}+e_{3})}
  
の部分空間
  
    
      
        
          
            C
          
          
            3
          
        
      
    
    {\displaystyle \mathbb {C} ^{3}}
  
は左正則表現に関して不変である。この部分空間に制限すると、自明な表現が得られる。

C
        
        (
        
          e
          
            1
          
        
        +
        
          e
          
            2
          
        
        +
        
          e
          
            3
          
        
        )
      
    
    {\displaystyle \mathbb {C} (e_{1}+e_{2}+e_{3})}
  
の直交補空間は
  
    
      
        
          C
        
        (
        
          e
          
            1
          
        
        −
        
          e
          
            2
          
        
        )
        ⊕
        
          C
        
        (
        
          e
          
            1
          
        
        +
        
          e
          
            2
          
        
        −
        2
        
          e
          
            3
          
        
        )
        .
      
    
    {\displaystyle \mathbb {C} (e_{1}-e_{2})\oplus \mathbb {C} (e_{1}+e_{2}-2e_{3}).}
  
である。この部分空間に制限すると、これもまた
  
    
      
        G
      
    
    {\displaystyle G}
  
不変であることが上記よりわかっており、表現
  
    
      
        τ
      
    
    {\displaystyle \tau }
  
が得られ、これは次のように与えられる。

繰り返しになるが、次章の既約性判定法を用いることで
  
    
      
        τ
      
    
    {\displaystyle \tau }
  
が既約であることを証明できる。今、
  
    
      
        η
      
    
    {\displaystyle \eta }
  
と
  
    
      
        τ
      
    
    {\displaystyle \tau }
  
は同型である。なぜなら、すべての
  
    
      
        s
        ∈
        
          Per
        
        (
        3
        )
        ,
      
    
    {\displaystyle s\in {\text{Per}}(3),}
  
に対して
  
    
      
        η
        (
        s
        )
        =
        B
        ∘
        τ
        (
        s
        )
        ∘
        
          B
          
            −
            1
          
        
      
    
    {\displaystyle \eta (s)=B\circ \tau (s)\circ B^{-1}}
  
が成り立ち、ここで
  
    
      
        B
        :
        
          
            C
          
          
            2
          
        
        →
        
          
            C
          
          
            2
          
        
      
    
    {\displaystyle B:\mathbb {C} ^{2}\to \mathbb {C} ^{2}}
  
は以下の行列で与えられるからである。

(
        ρ
        ,
        
          
            C
          
          
            5
          
        
        )
      
    
    {\displaystyle (\rho ,\mathbb {C} ^{5})}
  
の既約部分表現への分解は以下の通りである。
  
    
      
        ρ
        =
        τ
        ⊕
        η
        ⊕
        1
      
    
    {\displaystyle \rho =\tau \oplus \eta \oplus 1}
  
ここで
  
    
      
        1
      
    
    {\displaystyle 1}
  
は自明表現を表し、

は表現空間の対応する分解である。

同型な既約部分表現をすべてまとめることで、標準分解が得られる。
  
    
      
        
          ρ
          
            1
          
        
        :=
        η
        ⊕
        τ
      
    
    {\displaystyle \rho _{1}:=\eta \oplus \tau }
  
は、
  
    
      
        τ
      
    
    {\displaystyle \tau }
  
アイソタイプであり、
  
    
      
        ρ
      
    
    {\displaystyle \rho }
  
のそれである。したがって、標準分解は次のように与えられる。

上記の定理は、一般に無限群に対しては成立しない。これを以下の例で示す。

行列の乗法
  
    
      
        G
      
    
    {\displaystyle G}
  
とともに、これは無限群をなす。
  
    
      
        G
      
    
    {\displaystyle G}
  
は行列ベクトル積によって
  
    
      
        
          
            C
          
          
            2
          
        
      
    
    {\displaystyle \mathbb {C} ^{2}}
  
に作用する。すべての
  
    
      
        A
        ∈
        G
        .
      
    
    {\displaystyle A\in G.}
  
に対して表現
  
    
      
        ρ
        (
        A
        )
        =
        A
      
    
    {\displaystyle \rho (A)=A}
  
を考える。部分空間
  
    
      
        
          C
        
        
          e
          
            1
          
        
      
    
    {\displaystyle \mathbb {C} e_{1}}
  
は
  
    
      
        G
      
    
    {\displaystyle G}
  
不変部分空間である。しかし、この部分空間に対する
  
    
      
        G
      
    
    {\displaystyle G}
  
不変な補空間は存在しない。そのような補空間が存在するという仮定は、すべての行列が
  
    
      
        
          C
        
        .
      
    
    {\displaystyle \mathbb {C} .}
  
上で 対角化可能であることを意味することになる。これは誤りであることが知られており、したがって矛盾が生じる。

この話の教訓は、無限群を考える場合、既約でない表現であっても、既約部分表現の直和に分解できない可能性があるということである。

## 指標理論

### 定義

表現
  
    
      
        ρ
        :
        G
        →
        
          GL
        
        (
        V
        )
      
    
    {\displaystyle \rho :G\to {\text{GL}}(V)}
  
の指標は、次のような写像として定義される。

指標は2つの群の間の写像であるが、以下の例が示すように、一般には群準同型ではない。

表現
  
    
      
        ρ
        :
        
          Z
        
        
          /
        
        2
        
          Z
        
        ×
        
          Z
        
        
          /
        
        2
        
          Z
        
        →
        
          
            GL
          
          
            2
          
        
        (
        
          C
        
        )
      
    
    {\displaystyle \rho :\mathbb {Z} /2\mathbb {Z} \times \mathbb {Z} /2\mathbb {Z} \to {\text{GL}}_{2}(\mathbb {C} )}
  
を次のように定義する。

指標
  
    
      
        
          χ
          
            ρ
          
        
      
    
    {\displaystyle \chi _{\rho }}
  
は次のように与えられる。

置換表現の指標は特に計算が容易である。Vを有限集合
  
    
      
        X
      
    
    {\displaystyle X}
  
への
  
    
      
        G
      
    
    {\displaystyle G}
  
の左作用に対応するG-表現とすると、

例えば、[5] 正則表現
  
    
      
        R
      
    
    {\displaystyle R}
  
の指標は次のように与えられる。

ここで
  
    
      
        e
      
    
    {\displaystyle e}
  
は
  
    
      
        G
        .
      
    
    {\displaystyle G.}
  
の単位元を表す。

### 性質

指標の重要な性質として、次の公式がある。

この公式は、2つの正方行列の積 AB の トレースが BA のトレースと等しいという事実から導かれる。このような公式を満たす関数
  
    
      
        G
        →
        
          C
        
      
    
    {\displaystyle G\to \mathbb {C} }
  
は 類関数と呼ばれる。言い換えれば、類関数、特に指標は、各 共役類
  
    
      
        
          C
          
            s
          
        
        =
        {
        t
        s
        
          t
          
            −
            1
          
        
        
          |
        
        t
        ∈
        G
        }
        .
      
    
    {\displaystyle C_{s}=\{tst^{-1}|t\in G\}.}
  
上で定数である。また、トレースの基本的な性質から、
  
    
      
        χ
        (
        s
        )
      
    
    {\displaystyle \chi (s)}
  
は次のような和であることが従う。
  
    
      
        ρ
        (
        s
        )
      
    
    {\displaystyle \rho (s)}
  
の 固有値の重複度を込めた和である。表現の次数が n である場合、その和は n 個の項からなる。s の位数が m である場合、これらの固有値はすべて m 乗の 1の冪根である。この事実は
  
    
      
        χ
        (
        
          s
          
            −
            1
          
        
        )
        =
        
          
            
              χ
              (
              s
              )
            
            ¯
          
        
        ,
        
        
        
        ∀
        
        s
        ∈
        G
      
    
    {\displaystyle \chi (s^{-1})={\overline {\chi (s)}},\,\,\,\forall \,s\in G}
  
を示すために用いることができ、また
  
    
      
        
          |
        
        χ
        (
        s
        )
        
          |
        
        ⩽
        n
        .
      
    
    {\displaystyle |\chi (s)|\leqslant n.}
  
を含意する。

単位行列のトレースは行数に等しいため、
  
    
      
        χ
        (
        e
        )
        =
        n
        ,
      
    
    {\displaystyle \chi (e)=n,}
  
であり、ここで
  
    
      
        e
      
    
    {\displaystyle e}
  
は
  
    
      
        G
      
    
    {\displaystyle G}
  
の単位元であり、nはその表現の次元である。一般に、
  
    
      
        {
        s
        ∈
        G
        
          |
        
        χ
        (
        s
        )
        =
        n
        }
      
    
    {\displaystyle \{s\in G|\chi (s)=n\}}
  
は正規部分群である。
  
    
      
        G
        .
      
    
    {\displaystyle G.}
  
次の表は、指標がどのように
  
    
      
        
          χ
          
            1
          
        
        ,
        
          χ
          
            2
          
        
      
    
    {\displaystyle \chi _{1},\chi _{2}}
  
2つの与えられた表現の指標が
  
    
      
        
          ρ
          
            1
          
        
        :
        G
        →
        
          GL
        
        (
        
          V
          
            1
          
        
        )
        ,
        
          ρ
          
            2
          
        
        :
        G
        →
        
          GL
        
        (
        
          V
          
            2
          
        
        )
      
    
    {\displaystyle \rho _{1}:G\to {\text{GL}}(V_{1}),\rho _{2}:G\to {\text{GL}}(V_{2})}
  
関連する表現の指標を生み出すかを示している。

{
            
              
                
                  
                    ρ
                    
                      1
                    
                  
                  (
                  
                    0
                  
                  )
                  =
                  1
                
              
              
                
                  
                    ρ
                    
                      1
                    
                  
                  (
                  
                    1
                  
                  )
                  =
                  i
                
              
              
                
                  
                    ρ
                    
                      1
                    
                  
                  (
                  
                    2
                  
                  )
                  =
                  −
                  1
                
              
              
                
                  
                    ρ
                    
                      1
                    
                  
                  (
                  
                    3
                  
                  )
                  =
                  −
                  i
                
              
            
            
          
        
        
        
          
            {
            
              
                
                  
                    ρ
                    
                      2
                    
                  
                  (
                  
                    0
                  
                  )
                  =
                  1
                
              
              
                
                  
                    ρ
                    
                      2
                    
                  
                  (
                  
                    1
                  
                  )
                  =
                  −
                  1
                
              
              
                
                  
                    ρ
                    
                      2
                    
                  
                  (
                  
                    2
                  
                  )
                  =
                  1
                
              
              
                
                  
                    ρ
                    
                      2
                    
                  
                  (
                  
                    3
                  
                  )
                  =
                  −
                  1
                
              
            
            
          
        
        
        
          
            {
            
              
                
                  
                    ρ
                    
                      3
                    
                  
                  (
                  
                    0
                  
                  )
                  =
                  1
                
              
              
                
                  
                    ρ
                    
                      3
                    
                  
                  (
                  
                    1
                  
                  )
                  =
                  −
                  i
                
              
              
                
                  
                    ρ
                    
                      3
                    
                  
                  (
                  
                    2
                  
                  )
                  =
                  −
                  1
                
              
              
                
                  
                    ρ
                    
                      3
                    
                  
                  (
                  
                    3
                  
                  )
                  =
                  i
                
              
            
            
          
        
      
    
    {\displaystyle {\begin{cases}\rho _{1}({0})=1\\\rho _{1}({1})=i\\\rho _{1}({2})=-1\\\rho _{1}({3})=-i\end{cases}}\qquad {\begin{cases}\rho _{2}({0})=1\\\rho _{2}({1})=-1\\\rho _{2}({2})=1\\\rho _{2}({3})=-1\end{cases}}\qquad {\begin{cases}\rho _{3}({0})=1\\\rho _{3}({1})=-i\\\rho _{3}({2})=-1\\\rho _{3}({3})=i\end{cases}}}

構成上、
  
    
      
        V
        ⊗
        V
        =
        S
        y
        
          m
          
            2
          
        
        (
        V
        )
        ⊕
        
          ⋀
          
            2
          
        
        V
      
    
    {\displaystyle V\otimes V=Sym^{2}(V)\oplus \bigwedge ^{2}V}
  
の直和分解が存在する。指標について言えば、これは表の最後の2つの式の和が
  
    
      
        V
        ⊗
        V
      
    
    {\displaystyle V\otimes V}
  
の指標である
  
    
      
        χ
        (
        s
        
          )
          
            2
          
        
      
    
    {\displaystyle \chi (s)^{2}}
  
であるという事実に相当する。

### 内積と指標

指標に関する特に興味深い結果をいくつか示すために、群上のより一般的な型の関数を考察することが有益である。

定義（類関数）関数
  
    
      
        φ
        :
        G
        →
        
          C
        
      
    
    {\displaystyle \varphi :G\to \mathbb {C} }
  
が
  
    
      
        G
      
    
    {\displaystyle G}
  
の共役類上で定数であるとき、それを類関数と呼ぶ。すなわち、

行列のトレースは共役不変であるため、すべての指標は類関数であることに注意されたい。

すべての類関数の集合は
  
    
      
        
          C
        
      
    
    {\displaystyle \mathbb {C} }
  
代数であり、
  
    
      
        
          
            C
          
          
            class
          
        
        (
        G
        )
      
    
    {\displaystyle \mathbb {C} _{\text{class}}(G)}
  
と表記される。その次元は
  
    
      
        G
        .
      
    
    {\displaystyle G.}
  
の共役類の数に等しい。

本章の以下の結果の証明は、[1]、[2]、および[3]に見ることができる。

有限群上のすべての類関数の集合に対して内積を定義することができる。

正規直交性
  
    
      
        
          χ
          
            1
          
        
        ,
        …
        ,
        
          χ
          
            k
          
        
      
    
    {\displaystyle \chi _{1},\ldots ,\chi _{k}}
  
が
  
    
      
        G
      
    
    {\displaystyle G}
  
の相異なる既約指標である場合、それらは上述の内積に関してすべての類関数のベクトル空間の正規直交基底をなす。すなわち、

- {
            
              
                
                  
                    ρ
                    
                      1
                    
                  
                  (
                  
                    0
                  
                  )
                  =
                  1
                
              
              
                
                  
                    ρ
                    
                      1
                    
                  
                  (
                  
                    1
                  
                  )
                  =
                  i
                
              
              
                
                  
                    ρ
                    
                      1
                    
                  
                  (
                  
                    2
                  
                  )
                  =
                  −
                  1
                
              
              
                
                  
                    ρ
                    
                      1
                    
                  
                  (
                  
                    3
                  
                  )
                  =
                  −
                  i
                
              
            
            
          
        
        
        
          
            {
            
              
                
                  
                    ρ
                    
                      2
                    
                  
                  (
                  
                    0
                  
                  )
                  =
                  1
                
              
              
                
                  
                    ρ
                    
                      2
                    
                  
                  (
                  
                    1
                  
                  )
                  =
                  −
                  1
                
              
              
                
                  
                    ρ
                    
                      2
                    
                  
                  (
                  
                    2
                  
                  )
                  =
                  1
                
              
              
                
                  
                    ρ
                    
                      2
                    
                  
                  (
                  
                    3
                  
                  )
                  =
                  −
                  1
                
              
            
            
          
        
        
        
          
            {
            
              
                
                  
                    ρ
                    
                      3
                    
                  
                  (
                  
                    0
                  
                  )
                  =
                  1
                
              
              
                
                  
                    ρ
                    
                      3
                    
                  
                  (
                  
                    1
                  
                  )
                  =
                  −
                  i
                
              
              
                
                  
                    ρ
                    
                      3
                    
                  
                  (
                  
                    2
                  
                  )
                  =
                  −
                  1
                
              
              
                
                  
                    ρ
                    
                      3
                    
                  
                  (
                  
                    3
                  
                  )
                  =
                  i
                
              
            
            
          
        
      
    
    {\displaystyle {\begin{cases}\rho _{1}({0})=1\\\rho _{1}({1})=i\\\rho _{1}({2})=-1\\\rho _{1}({3})=-i\end{cases}}\qquad {\begin{cases}\rho _{2}({0})=1\\\rho _{2}({1})=-1\\\rho _{2}({2})=1\\\rho _{2}({3})=-1\end{cases}}\qquad {\begin{cases}\rho _{3}({0})=1\\\rho _{3}({1})=-i\\\rho _{3}({2})=-1\\\rho _{3}({3})=i\end{cases}}}
- すべての類関数
  
    
      
        f
      
    
    {\displaystyle f}
  
は、既約指標
  
    
      
        
          χ
          
            1
          
        
        ,
        …
        ,
        
          χ
          
            k
          
        
      
    
    {\displaystyle \chi _{1},\ldots ,\chi _{k}}
  
の唯一の線形結合として表現できる。
既約指標が
  
    
      
        
          
            C
          
          
            class
          
        
        (
        G
        )
      
    
    {\displaystyle \mathbb {C} _{\text{class}}(G)}
  
を生成することは、すべての既約指標と直交する非零の類関数が存在しないことを示すことで検証できる。
  
    
      
        ρ
      
    
    {\displaystyle \rho }
  
を表現、
  
    
      
        f
      
    
    {\displaystyle f}
  
を類関数とし、
  
    
      
        
          ρ
          
            f
          
        
        =
        
          ∑
          
            g
          
        
        f
        (
        g
        )
        ρ
        (
        g
        )
        .
      
    
    {\displaystyle \rho _{f}=\sum _{g}f(g)\rho (g).}
  
と表記する。このとき、既約表現
  
    
      
        ρ
      
    
    {\displaystyle \rho }
  
に対して、シューアの補題より
  
    
      
        
          ρ
          
            f
          
        
        =
        
          
            
              
                |
              
              G
              
                |
              
            
            n
          
        
        ⟨
        f
        ,
        
          χ
          
            V
          
          
            ∗
          
        
        ⟩
        ∈
        E
        n
        d
        (
        V
        )
      
    
    {\displaystyle \rho _{f}={\frac {|G|}{n}}\langle f,\chi _{V}^{*}\rangle \in End(V)}
  
が成り立つ。
  
    
      
        f
      
    
    {\displaystyle f}
  
をすべての指標と直交する類関数と仮定する。このとき、上記より、
  
    
      
        ρ
      
    
    {\displaystyle \rho }
  
が既約であるときは常に
  
    
      
        
          ρ
          
            f
          
        
        =
        0
      
    
    {\displaystyle \rho _{f}=0}
  
が成り立つ。しかし、分解可能性により、すべての
  
    
      
        ρ
      
    
    {\displaystyle \rho }
  
に対して
  
    
      
        
          ρ
          
            f
          
        
        =
        0
      
    
    {\displaystyle \rho _{f}=0}
  
が従う。
  
    
      
        ρ
      
    
    {\displaystyle \rho }
  
を正則表現とする。
  
    
      
        
          ρ
          
            f
          
        
      
    
    {\displaystyle \rho _{f}}
  
をある特定の基底元
  
    
      
        g
      
    
    {\displaystyle g}
  
に適用すると、
  
    
      
        f
        (
        g
        )
        =
        0
      
    
    {\displaystyle f(g)=0}
  
を得る。これがすべての
  
    
      
        g
      
    
    {\displaystyle g}
  
に対して真であるため、
  
    
      
        f
        =
        0.
      
    
    {\displaystyle f=0.}
  
が成り立つ。

正規直交性から、群
  
    
      
        G
      
    
    {\displaystyle G}
  
の非同型な既約表現の数は、
  
    
      
        G
        .
      
    
    {\displaystyle G.}
  
の共役類の数に等しいことが導かれる。

さらに、
  
    
      
        G
      
    
    {\displaystyle G}
  
上の類関数が
  
    
      
        G
      
    
    {\displaystyle G}
  
の指標であるための必要十分条件は、それが非負整数係数を持つ相異なる既約指標
  
    
      
        
          χ
          
            j
          
        
      
    
    {\displaystyle \chi _{j}}
  
の線形結合として書けることである。すなわち、
  
    
      
        φ
      
    
    {\displaystyle \varphi }
  
が
  
    
      
        G
      
    
    {\displaystyle G}
  
上の類関数であり、
  
    
      
        φ
        =
        
          c
          
            1
          
        
        
          χ
          
            1
          
        
        +
        ⋯
        +
        
          c
          
            k
          
        
        
          χ
          
            k
          
        
      
    
    {\displaystyle \varphi =c_{1}\chi _{1}+\cdots +c_{k}\chi _{k}}
  
（ここで
  
    
      
        
          c
          
            j
          
        
      
    
    {\displaystyle c_{j}}
  
は非負整数）であるならば、
  
    
      
        φ
      
    
    {\displaystyle \varphi }
  
は
  
    
      
        
          χ
          
            j
          
        
        .
      
    
    {\displaystyle \chi _{j}.}
  
に対応する表現
  
    
      
        
          τ
          
            j
          
        
      
    
    {\displaystyle \tau _{j}}
  
の直和
  
    
      
        
          c
          
            1
          
        
        
          τ
          
            1
          
        
        ⊕
        ⋯
        ⊕
        
          c
          
            k
          
        
        
          τ
          
            k
          
        
      
    
    {\displaystyle c_{1}\tau _{1}\oplus \cdots \oplus c_{k}\tau _{k}}
  
の指標である。逆に、任意の指標を既約指標の和として書くことは常に可能である。

上述の内積は、すべての
  
    
      
        
          C
        
      
    
    {\displaystyle \mathbb {C} }
  
値関数
  
    
      
        
          L
          
            1
          
        
        (
        G
        )
      
    
    {\displaystyle L^{1}(G)}
  
の集合上に拡張できる。

対称双線形形式もまた
  
    
      
        
          L
          
            1
          
        
        (
        G
        )
        :
      
    
    {\displaystyle L^{1}(G):}
  
上に定義できる。

これら2つの形式は指標の集合上で一致する。混同の恐れがない場合は、両方の形式
  
    
      
        (
        ⋅
        
          |
        
        ⋅
        
          )
          
            G
          
        
      
    
    {\displaystyle (\cdot |\cdot )_{G}}
  
および
  
    
      
        ⟨
        ⋅
        
          |
        
        ⋅
        
          ⟩
          
            G
          
        
      
    
    {\displaystyle \langle \cdot |\cdot \rangle _{G}}
  
の添字は省略される。

V
          
            1
          
        
        ,
        
          V
          
            2
          
        
      
    
    {\displaystyle V_{1},V_{2}}
  
を2つの
  
    
      
        
          C
        
        [
        G
        ]
      
    
    {\displaystyle \mathbb {C} [G]}
  
加群とする。
  
    
      
        
          C
        
        [
        G
        ]
      
    
    {\displaystyle \mathbb {C} [G]}
  
加群は単に
  
    
      
        G
      
    
    {\displaystyle G}
  
の表現であることに注意されたい。正規直交性により、
  
    
      
        G
      
    
    {\displaystyle G}
  
の既約表現の数はその共役類の数と正確に一致するため、
  
    
      
        G
        .
      
    
    {\displaystyle G.}
  
の共役類と同数（同型を除いて）の単純
  
    
      
        
          C
        
        [
        G
        ]
      
    
    {\displaystyle \mathbb {C} [G]}
  
加群が存在することになる。

⟨
        
          V
          
            1
          
        
        ,
        
          V
          
            2
          
        
        
          ⟩
          
            G
          
        
        :=
        dim
        ⁡
        (
        
          
            Hom
          
          
            G
          
        
        (
        
          V
          
            1
          
        
        ,
        
          V
          
            2
          
        
        )
        )
        ,
      
    
    {\displaystyle \langle V_{1},V_{2}\rangle _{G}:=\dim({\text{Hom}}^{G}(V_{1},V_{2})),}
  
を定義する。ここで
  
    
      
        
          
            Hom
          
          
            G
          
        
        (
        
          V
          
            1
          
        
        ,
        
          V
          
            2
          
        
        )
      
    
    {\displaystyle {\text{Hom}}^{G}(V_{1},V_{2})}
  
はすべての
  
    
      
        G
      
    
    {\displaystyle G}
  
線形写像のベクトル空間である。この形式は直和に関して双線形である。

以下では、これらの双線形形式を用いることで、表現の分解および既約性に関するいくつかの重要な結果を得る。

例えば、
  
    
      
        
          χ
          
            1
          
        
      
    
    {\displaystyle \chi _{1}}
  
および
  
    
      
        
          χ
          
            2
          
        
      
    
    {\displaystyle \chi _{2}}
  
をそれぞれ
  
    
      
        
          V
          
            1
          
        
      
    
    {\displaystyle V_{1}}
  
および
  
    
      
        
          V
          
            2
          
        
        ,
      
    
    {\displaystyle V_{2},}
  
の指標とする。このとき
  
    
      
        ⟨
        
          χ
          
            1
          
        
        ,
        
          χ
          
            2
          
        
        
          ⟩
          
            G
          
        
        =
        (
        
          χ
          
            1
          
        
        
          |
        
        
          χ
          
            2
          
        
        
          )
          
            G
          
        
        =
        ⟨
        
          V
          
            1
          
        
        ,
        
          V
          
            2
          
        
        
          ⟩
          
            G
          
        
        .
      
    
    {\displaystyle \langle \chi _{1},\chi _{2}\rangle _{G}=(\chi _{1}|\chi _{2})_{G}=\langle V_{1},V_{2}\rangle _{G}.}
  
である。

上記の結果とシューアの補題、および表現の完全可約性から、以下の定理を導くことが可能である。

これを用いて、表現を解析するための非常に有用な結果が得られる。

既約性判定法
  
    
      
        χ
      
    
    {\displaystyle \chi }
  
を表現の指標とする。
  
    
      
        V
        ,
      
    
    {\displaystyle V,}
  
とすると、
  
    
      
        (
        χ
        
          |
        
        χ
        )
        ∈
        
          
            N
          
          
            0
          
        
        .
      
    
    {\displaystyle (\chi |\chi )\in \mathbb {N} _{0}.}
  
の場合、
  
    
      
        (
        χ
        
          |
        
        χ
        )
        =
        1
      
    
    {\displaystyle (\chi |\chi )=1}
  
が成り立つのは、かつそのときに限り
  
    
      
        V
      
    
    {\displaystyle V}
  
は既約である。

したがって、第一定理を用いると、
  
    
      
        G
      
    
    {\displaystyle G}
  
の既約表現の指標は、
  
    
      
        
          
            C
          
          
            class
          
        
        (
        G
        )
      
    
    {\displaystyle \mathbb {C} _{\text{class}}(G)}
  
上、この内積に関して正規直交系をなす。

群代数の観点からは、これは
  
    
      
        
          C
        
        [
        G
        ]
        ≅
        
          ⊕
          
            j
          
        
        
          End
        
        (
        
          W
          
            j
          
        
        )
      
    
    {\displaystyle \mathbb {C} [G]\cong \oplus _{j}{\text{End}}(W_{j})}
  
が代数として同型であることを意味する。

数値的な結果として次を得る。

ここで、
  
    
      
        R
      
    
    {\displaystyle R}
  
は正則表現であり、
  
    
      
        
          χ
          
            
              W
              
                j
              
            
          
        
      
    
    {\displaystyle \chi _{W_{j}}}
  
および
  
    
      
        
          χ
          
            R
          
        
      
    
    {\displaystyle \chi _{R}}
  
はそれぞれ
  
    
      
        
          W
          
            j
          
        
      
    
    {\displaystyle W_{j}}
  
および
  
    
      
        R
        ,
      
    
    {\displaystyle R,}
  
に対応する指標である。
  
    
      
        e
      
    
    {\displaystyle e}
  
は群の単位元を表すことに注意せよ。

この公式は、群の既約表現を同型を除いて分類するという問題に対する「必要十分」条件である。これは、ある群の既約表現の同型類をすべて見つけたかどうかを確認する手段を提供する。

同様に、
  
    
      
        s
        ≠
        e
        ,
      
    
    {\displaystyle s\neq e,}
  
で評価した正則表現の指標を用いることで、次の等式を得る。

畳み込み代数を通じた表現の記述を用いることで、これらの等式の同値な定式化が得られる。

さらに、プランシュレルの公式が成り立つ。

両方の公式において、
  
    
      
        (
        ρ
        ,
        
          V
          
            ρ
          
        
        )
      
    
    {\displaystyle (\rho ,V_{\rho })}
  
は群
  
    
      
        G
        ,
        s
        ∈
        G
      
    
    {\displaystyle G,s\in G}
  
の線形表現であり、
  
    
      
        f
        ,
        h
        ∈
        
          L
          
            1
          
        
        (
        G
        )
        .
      
    
    {\displaystyle f,h\in L^{1}(G).}
  
である。

上記の系にはさらなる帰結がある。

- G
      
    
    {\displaystyle G}
  
は可換である。
- G
      
    
    {\displaystyle G}
  
上のすべての関数は類関数である。
- G
      
    
    {\displaystyle G}
  
のすべての既約表現は次数
  
    
      
        1.
      
    
    {\displaystyle 1.}
  
を持つ。

## 誘導表現

線形表現の性質の節で示したように、群の表現から出発して、制限によって部分群の表現を得ることができる。当然ながら、我々は逆の過程に関心がある。すなわち、部分群の表現から出発して群の表現を得ることは可能であろうか。以下に定義する誘導表現が、必要な概念を提供してくれることがわかるであろう。もっとも、この構成は制限の逆ではなく、随伴である。

### 定義

ρ
        :
        G
        →
        
          GL
        
        (
        
          V
          
            ρ
          
        
        )
      
    
    {\displaystyle \rho :G\to {\text{GL}}(V_{\rho })}
  
を
  
    
      
        G
        .
      
    
    {\displaystyle G.}
  
の線形表現とする。
  
    
      
        H
      
    
    {\displaystyle H}
  
を部分群、
  
    
      
        ρ
        
          
            |
          
          
            H
          
        
      
    
    {\displaystyle \rho |_{H}}
  
をその制限とする。
  
    
      
        W
      
    
    {\displaystyle W}
  
を
  
    
      
        
          ρ
          
            H
          
        
        .
      
    
    {\displaystyle \rho _{H}.}
  
の部分表現とする。この表現を
  
    
      
        θ
        :
        H
        →
        
          GL
        
        (
        W
        )
      
    
    {\displaystyle \theta :H\to {\text{GL}}(W)}
  
と書く。
  
    
      
        s
        ∈
        G
        .
      
    
    {\displaystyle s\in G.}
  
とする。ベクトル空間
  
    
      
        ρ
        (
        s
        )
        (
        W
        )
      
    
    {\displaystyle \rho (s)(W)}
  
は
  
    
      
        s
        .
      
    
    {\displaystyle s.}
  
の 左剰余類
  
    
      
        s
        H
      
    
    {\displaystyle sH}
  
のみに依存する。
  
    
      
        R
      
    
    {\displaystyle R}
  
を
  
    
      
        G
        
          /
        
        H
        ,
      
    
    {\displaystyle G/H,}
  
の 代表系とすると、次が成り立つ。

は
  
    
      
        
          V
          
            ρ
          
        
        .
      
    
    {\displaystyle V_{\rho }.}
  
の部分表現である。

G
      
    
    {\displaystyle G}
  
の
  
    
      
        
          V
          
            ρ
          
        
      
    
    {\displaystyle V_{\rho }}
  
における表現
  
    
      
        ρ
      
    
    {\displaystyle \rho }
  
が、
  
    
      
        H
      
    
    {\displaystyle H}
  
の
  
    
      
        W
        ,
      
    
    {\displaystyle W,}
  
における表現
  
    
      
        θ
      
    
    {\displaystyle \theta }
  
によって誘導されるとは、次が成り立つことである。

ここで
  
    
      
        
          W
          
            r
          
        
        =
        ρ
        (
        s
        )
        (
        W
        )
      
    
    {\displaystyle W_{r}=\rho (s)(W)}
  
すべての
  
    
      
        s
        ∈
        r
        H
      
    
    {\displaystyle s\in rH}
  
およびすべての
  
    
      
        r
        ∈
        R
        .
      
    
    {\displaystyle r\in R.}
  
言い換えれば、表現
  
    
      
        (
        ρ
        ,
        
          V
          
            ρ
          
        
        )
      
    
    {\displaystyle (\rho ,V_{\rho })}
  
は、次によって誘導される
  
    
      
        (
        θ
        ,
        W
        )
        ,
      
    
    {\displaystyle (\theta ,W),}
  
もしすべての
  
    
      
        v
        ∈
        
          V
          
            ρ
          
        
      
    
    {\displaystyle v\in V_{\rho }}
  
が一意に次のように書けるならば

ここで、すべての
  
    
      
        r
        ∈
        R
        .
      
    
    {\displaystyle r\in R.}
  
に対して
  
    
      
        
          w
          
            r
          
        
        ∈
        
          W
          
            r
          
        
      
    
    {\displaystyle w_{r}\in W_{r}}
  
である。

θ
      
    
    {\displaystyle \theta }
  
の表現
  
    
      
        H
      
    
    {\displaystyle H}
  
によって誘導される
  
    
      
        G
      
    
    {\displaystyle G}
  
の表現
  
    
      
        ρ
      
    
    {\displaystyle \rho }
  
を
  
    
      
        ρ
        =
        
          
            Ind
          
          
            H
          
          
            G
          
        
        (
        θ
        )
        ,
      
    
    {\displaystyle \rho ={\text{Ind}}_{H}^{G}(\theta ),}
  
、あるいは混同の恐れがない場合は簡潔に
  
    
      
        ρ
        =
        
          Ind
        
        (
        θ
        )
        ,
      
    
    {\displaystyle \rho ={\text{Ind}}(\theta ),}
  
と表記する。表現
  
    
      
        V
      
    
    {\displaystyle V}
  
が
  
    
      
        W
        .
      
    
    {\displaystyle W.}
  
によって誘導される場合、表現写像そのものではなく表現空間自体が頻繁に使用される。すなわち
  
    
      
        V
        =
        
          
            Ind
          
          
            H
          
          
            G
          
        
        (
        W
        )
        ,
      
    
    {\displaystyle V={\text{Ind}}_{H}^{G}(W),}
  
や
  
    
      
        V
        =
        
          Ind
        
        (
        W
        )
        ,
      
    
    {\displaystyle V={\text{Ind}}(W),}
  
と表記される。

#### 誘導表現の代替的な記述

群環を用いることで、誘導表現の代替的な記述が得られる。

G
      
    
    {\displaystyle G}
  
を群、
  
    
      
        V
      
    
    {\displaystyle V}
  
を
  
    
      
        
          C
        
        [
        G
        ]
      
    
    {\displaystyle \mathbb {C} [G]}
  
加群、
  
    
      
        W
      
    
    {\displaystyle W}
  
を
  
    
      
        G
        .
      
    
    {\displaystyle G.}
  
の部分群
  
    
      
        H
      
    
    {\displaystyle H}
  
に対応する
  
    
      
        V
      
    
    {\displaystyle V}
  
の
  
    
      
        
          C
        
        [
        H
        ]
      
    
    {\displaystyle \mathbb {C} [H]}
  
部分加群とする。
  
    
      
        V
      
    
    {\displaystyle V}
  
が
  
    
      
        W
      
    
    {\displaystyle W}
  
によって誘導されるとは、
  
    
      
        V
        =
        
          C
        
        [
        G
        ]
        
          ⊗
          
            
              C
            
            [
            H
            ]
          
        
        W
        ,
      
    
    {\displaystyle V=\mathbb {C} [G]\otimes _{\mathbb {C} [H]}W,}
  
が成り立つことをいう。ここで
  
    
      
        G
      
    
    {\displaystyle G}
  
は第一因子に次のように作用する：すべての
  
    
      
        s
        ,
        t
        ∈
        G
        ,
        w
        ∈
        W
        .
      
    
    {\displaystyle s,t\in G,w\in W.}
  
に対して
  
    
      
        s
        ⋅
        (
        
          e
          
            t
          
        
        ⊗
        w
        )
        =
        
          e
          
            s
            t
          
        
        ⊗
        w
      
    
    {\displaystyle s\cdot (e_{t}\otimes w)=e_{st}\otimes w}
  
である。

### 性質

本節で導入する結果は証明なしで提示する。これらは [1]および [2]に見ることができる。

これは、
  
    
      
        
          V
          ′
        
      
    
    {\displaystyle V'}
  
を
  
    
      
        
          C
        
        [
        G
        ]
      
    
    {\displaystyle \mathbb {C} [G]}
  
加群として解釈すれば、
  
    
      
        
          
            Hom
          
          
            H
          
        
        (
        
          W
          
            θ
          
        
        ,
        
          V
          ′
        
        )
        ≅
        
          
            Hom
          
          
            G
          
        
        (
        
          V
          
            ρ
          
        
        ,
        
          V
          ′
        
        )
        ,
      
    
    {\displaystyle {\text{Hom}}^{H}(W_{\theta },V')\cong {\text{Hom}}^{G}(V_{\rho },V'),}
  
が成り立つことを意味する。ここで
  
    
      
        
          
            Hom
          
          
            G
          
        
        (
        
          V
          
            ρ
          
        
        ,
        
          V
          ′
        
        )
      
    
    {\displaystyle {\text{Hom}}^{G}(V_{\rho },V')}
  
は
  
    
      
        
          V
          
            ρ
          
        
      
    
    {\displaystyle V_{\rho }}
  
から
  
    
      
        
          V
          ′
        
        .
      
    
    {\displaystyle V'.}
  
へのすべての
  
    
      
        
          C
        
        [
        G
        ]
      
    
    {\displaystyle \mathbb {C} [G]}
  
準同型からなるベクトル空間である。同じことが
  
    
      
        
          
            Hom
          
          
            H
          
        
        (
        
          W
          
            θ
          
        
        ,
        
          V
          ′
        
        )
        .
      
    
    {\displaystyle {\text{Hom}}^{H}(W_{\theta },V').}
  
についても成り立つ。

類関数の誘導。表現の場合と同様に、部分群上の類関数から群上の類関数を誘導によって得ることができる。
  
    
      
        φ
      
    
    {\displaystyle \varphi }
  
を
  
    
      
        H
        .
      
    
    {\displaystyle H.}
  
上の類関数とするとき、
  
    
      
        G
      
    
    {\displaystyle G}
  
上の関数
  
    
      
        
          φ
          ′
        
      
    
    {\displaystyle \varphi '}
  
を次のように定義する。

φ
          ′
        
      
    
    {\displaystyle \varphi '}
  
は
  
    
      
        φ
      
    
    {\displaystyle \varphi }
  
によって誘導されるといい、
  
    
      
        
          
            Ind
          
          
            H
          
          
            G
          
        
        (
        φ
        )
        =
        
          φ
          ′
        
      
    
    {\displaystyle {\text{Ind}}_{H}^{G}(\varphi )=\varphi '}
  
または
  
    
      
        
          Ind
        
        (
        φ
        )
        =
        
          φ
          ′
        
        .
      
    
    {\displaystyle {\text{Ind}}(\varphi )=\varphi '.}
  
と書く。

### フロベニウスの相互律

先取りした要約として、フロベニウスの相互律から得られる教訓は、写像
  
    
      
        
          Res
        
      
    
    {\displaystyle {\text{Res}}}
  
と
  
    
      
        
          Ind
        
      
    
    {\displaystyle {\text{Ind}}}
  
が互いに随伴であるということである。

W
      
    
    {\displaystyle W}
  
を
  
    
      
        H
      
    
    {\displaystyle H}
  
の既約表現、
  
    
      
        V
      
    
    {\displaystyle V}
  
を
  
    
      
        G
        ,
      
    
    {\displaystyle G,}
  
の既約表現とする。このとき、フロベニウスの相互律は、
  
    
      
        W
      
    
    {\displaystyle W}
  
が
  
    
      
        
          Res
        
        (
        V
        )
      
    
    {\displaystyle {\text{Res}}(V)}
  
に含まれる回数は
  
    
      
        
          Ind
        
        (
        W
        )
      
    
    {\displaystyle {\text{Ind}}(W)}
  
が
  
    
      
        V
        .
      
    
    {\displaystyle V.}
  
に含まれる回数と同じであることを示している。

この主張は内積に対しても有効である。

### マッキーの既約性判定法

ジョージ・マッキーは、誘導表現の既約性を検証するための判定法を確立した。これにはまず、いくつかの定義と記法に関する仕様が必要となる。

群
  
    
      
        G
      
    
    {\displaystyle G}
  
の2つの表現
  
    
      
        
          V
          
            1
          
        
      
    
    {\displaystyle V_{1}}
  
および
  
    
      
        
          V
          
            2
          
        
      
    
    {\displaystyle V_{2}}
  
は、共通の既約成分を持たない場合、すなわち
  
    
      
        ⟨
        
          V
          
            1
          
        
        ,
        
          V
          
            2
          
        
        
          ⟩
          
            G
          
        
        =
        0.
      
    
    {\displaystyle \langle V_{1},V_{2}\rangle _{G}=0.}
  
である場合、互いに素であるという。

G
      
    
    {\displaystyle G}
  
を群、
  
    
      
        H
      
    
    {\displaystyle H}
  
を部分群とする。
  
    
      
        s
        ∈
        G
        .
      
    
    {\displaystyle s\in G.}
  
に対して
  
    
      
        
          H
          
            s
          
        
        =
        s
        H
        
          s
          
            −
            1
          
        
        ∩
        H
      
    
    {\displaystyle H_{s}=sHs^{-1}\cap H}
  
を定義する。
  
    
      
        (
        ρ
        ,
        W
        )
      
    
    {\displaystyle (\rho ,W)}
  
を部分群
  
    
      
        H
        .
      
    
    {\displaystyle H.}
  
の表現とする。これは制限によって
  
    
      
        
          H
          
            s
          
        
        .
      
    
    {\displaystyle H_{s}.}
  
の表現
  
    
      
        
          
            Res
          
          
            
              H
              
                s
              
            
          
        
        (
        ρ
        )
      
    
    {\displaystyle {\text{Res}}_{H_{s}}(\rho )}
  
を定義する。
  
    
      
        
          
            Res
          
          
            
              H
              
                s
              
            
          
        
        (
        ρ
        )
        .
      
    
    {\displaystyle {\text{Res}}_{H_{s}}(\rho ).}
  
に対して
  
    
      
        
          
            Res
          
          
            s
          
        
        (
        ρ
        )
      
    
    {\displaystyle {\text{Res}}_{s}(\rho )}
  
と書く。また、
  
    
      
        
          ρ
          
            s
          
        
        (
        t
        )
        =
        ρ
        (
        
          s
          
            −
            1
          
        
        t
        s
        )
        .
      
    
    {\displaystyle \rho ^{s}(t)=\rho (s^{-1}ts).}
  
によって
  
    
      
        
          H
          
            s
          
        
      
    
    {\displaystyle H_{s}}
  
の別の表現
  
    
      
        
          ρ
          
            s
          
        
      
    
    {\displaystyle \rho ^{s}}
  
を定義する。これら2つの表現は混同してはならない。

- W
      
    
    {\displaystyle W}
  
は既約である
- 各
  
    
      
        s
        ∈
        G
        ∖
        H
      
    
    {\displaystyle s\in G\setminus H}
  
に対して、
  
    
      
        
          H
          
            s
          
        
      
    
    {\displaystyle H_{s}}
  
の2つの表現
  
    
      
        
          ρ
          
            s
          
        
      
    
    {\displaystyle \rho ^{s}}
  
と
  
    
      
        
          
            Res
          
          
            s
          
        
        (
        ρ
        )
      
    
    {\displaystyle {\text{Res}}_{s}(\rho )}
  
は互いに素である。[6]
H
      
    
    {\displaystyle H}
  
が正規部分群である場合、
  
    
      
        
          H
          
            s
          
        
        =
        H
      
    
    {\displaystyle H_{s}=H}
  
および
  
    
      
        
          
            Res
          
          
            s
          
        
        (
        ρ
        )
        =
        ρ
      
    
    {\displaystyle {\text{Res}}_{s}(\rho )=\rho }
  
が成り立つ。したがって、次が得られる。

### 特別な群への応用

本節では、これまでに提示した理論の正規部分群への応用、および部分群とアーベル正規部分群の半直積という特別な群への応用について述べる。

- A
      
    
    {\displaystyle A}
  
を含む
  
    
      
        G
      
    
    {\displaystyle G}
  
の真部分群
  
    
      
        H
      
    
    {\displaystyle H}
  
が存在し、かつ
  
    
      
        ρ
      
    
    {\displaystyle \rho }
  
を誘導する
  
    
      
        H
      
    
    {\displaystyle H}
  
の既約表現
  
    
      
        η
      
    
    {\displaystyle \eta }
  
が存在する、
- あるいは
  
    
      
        V
      
    
    {\displaystyle V}
  
が等型
  
    
      
        
          C
        
        A
      
    
    {\displaystyle \mathbb {C} A}
  
加群である。
A
      
    
    {\displaystyle A}
  
がアーベル群である場合、
  
    
      
        A
      
    
    {\displaystyle A}
  
の等型加群は既約であり、次数1であり、すべて相似変換であることに注意せよ。

A
      
    
    {\displaystyle A}
  
が
  
    
      
        G
      
    
    {\displaystyle G}
  
の（必ずしも正規とは限らない）アーベル部分群である場合、一般に
  
    
      
        deg
        ⁡
        (
        τ
        )
        
          |
        
        (
        G
        :
        A
        )
      
    
    {\displaystyle \deg(\tau )|(G:A)}
  
は満たされないが、それでもなお
  
    
      
        deg
        ⁡
        (
        τ
        )
        ≤
        (
        G
        :
        A
        )
      
    
    {\displaystyle \deg(\tau )\leq (G:A)}
  
は有効である。

#### 半直積の表現の分類

以下では、
  
    
      
        G
        =
        A
        ⋊
        H
      
    
    {\displaystyle G=A\rtimes H}
  
を半直積とし、その正規半直積因子が
  
    
      
        A
      
    
    {\displaystyle A}
  
はアーベル群であるとする。このような群の既約表現は
  
    
      
        G
        ,
      
    
    {\displaystyle G,}
  
、そのすべての既約表現が
  
    
      
        G
      
    
    {\displaystyle G}
  
の特定の正規部分群から構成できることを示すことで分類可能である。
  
    
      
        H
      
    
    {\displaystyle H}
  
。これはウィグナーおよびマッキーによるいわゆる「リトルグループ」法である。

A
      
    
    {\displaystyle A}
  
は可換であるため、
  
    
      
        A
      
    
    {\displaystyle A}
  
の既約指標は次数1であり、群
  
    
      
        
          X
        
        =
        
          Hom
        
        (
        A
        ,
        
          
            C
          
          
            ×
          
        
        )
        .
      
    
    {\displaystyle \mathrm {X} ={\text{Hom}}(A,\mathbb {C} ^{\times }).}
  
を形成する。群
  
    
      
        G
      
    
    {\displaystyle G}
  
は、
  
    
      
        s
        ∈
        G
        ,
        χ
        ∈
        
          X
        
        ,
        a
        ∈
        A
        .
      
    
    {\displaystyle s\in G,\chi \in \mathrm {X} ,a\in A.}
  
に対して
  
    
      
        (
        s
        χ
        )
        (
        a
        )
        =
        χ
        (
        
          s
          
            −
            1
          
        
        a
        s
        )
      
    
    {\displaystyle (s\chi )(a)=\chi (s^{-1}as)}
  
により
  
    
      
        
          X
        
      
    
    {\displaystyle \mathrm {X} }
  
に作用する。

(
        
          χ
          
            j
          
        
        
          )
          
            j
            ∈
            
              X
            
            
              /
            
            H
          
        
      
    
    {\displaystyle (\chi _{j})_{j\in \mathrm {X} /H}}
  
を 代表系、軌道 とする。
  
    
      
        H
      
    
    {\displaystyle H}
  
の
  
    
      
        
          X
        
        .
      
    
    {\displaystyle \mathrm {X} .}
  
における軌道の代表系をとする。すべての
  
    
      
        j
        ∈
        
          X
        
        
          /
        
        H
      
    
    {\displaystyle j\in \mathrm {X} /H}
  
に対して
  
    
      
        
          H
          
            j
          
        
        =
        {
        t
        ∈
        H
        :
        t
        
          χ
          
            j
          
        
        =
        
          χ
          
            j
          
        
        }
        .
      
    
    {\displaystyle H_{j}=\{t\in H:t\chi _{j}=\chi _{j}\}.}
  
とおく。これは
  
    
      
        H
        .
      
    
    {\displaystyle H.}
  
の部分群である。
  
    
      
        G
        .
      
    
    {\displaystyle G.}
  
における対応する部分群を
  
    
      
        
          G
          
            j
          
        
        =
        A
        ⋅
        
          H
          
            j
          
        
      
    
    {\displaystyle G_{j}=A\cdot H_{j}}
  
とする。ここで、
  
    
      
        a
        ∈
        A
        ,
        t
        ∈
        
          H
          
            j
          
        
        .
      
    
    {\displaystyle a\in A,t\in H_{j}.}
  
に対して
  
    
      
        
          χ
          
            j
          
        
        (
        a
        t
        )
        =
        
          χ
          
            j
          
        
        (
        a
        )
      
    
    {\displaystyle \chi _{j}(at)=\chi _{j}(a)}
  
と定めることにより、関数
  
    
      
        
          χ
          
            j
          
        
      
    
    {\displaystyle \chi _{j}}
  
を
  
    
      
        
          G
          
            j
          
        
      
    
    {\displaystyle G_{j}}
  
上に拡張する。したがって、
  
    
      
        
          χ
          
            j
          
        
      
    
    {\displaystyle \chi _{j}}
  
は
  
    
      
        
          G
          
            j
          
        
        .
      
    
    {\displaystyle G_{j}.}
  
上の類関数となる。さらに、すべての
  
    
      
        t
        ∈
        
          H
          
            j
          
        
        ,
      
    
    {\displaystyle t\in H_{j},}
  
に対して
  
    
      
        t
        
          χ
          
            j
          
        
        =
        
          χ
          
            j
          
        
      
    
    {\displaystyle t\chi _{j}=\chi _{j}}
  
であることから、
  
    
      
        
          χ
          
            j
          
        
      
    
    {\displaystyle \chi _{j}}
  
が
  
    
      
        
          G
          
            j
          
        
      
    
    {\displaystyle G_{j}}
  
から
  
    
      
        
          
            C
          
          
            ×
          
        
        .
      
    
    {\displaystyle \mathbb {C} ^{\times }.}
  
への群準同型写像であることが示される。ゆえに、
  
    
      
        
          G
          
            j
          
        
      
    
    {\displaystyle G_{j}}
  
の1次表現が得られ、それは自身の指標と一致する。

次に
  
    
      
        
          H
          
            j
          
        
        .
      
    
    {\displaystyle H_{j}.}
  
の既約表現を
  
    
      
        ρ
      
    
    {\displaystyle \rho }
  
とする。
  
    
      
        ρ
      
    
    {\displaystyle \rho }
  
と 標準射影
  
    
      
        
          G
          
            j
          
        
        →
        
          H
          
            j
          
        
        .
      
    
    {\displaystyle G_{j}\to H_{j}.}
  
を組み合わせることで、
  
    
      
        
          G
          
            j
          
        
        ,
      
    
    {\displaystyle G_{j},}
  
の既約表現
  
    
      
        
          
            
              ρ
              ~
            
          
        
      
    
    {\displaystyle {\tilde {\rho }}}
  
が得られる。最後に、
  
    
      
        
          χ
          
            j
          
        
      
    
    {\displaystyle \chi _{j}}
  
と
  
    
      
        
          
            
              ρ
              ~
            
          
        
        .
      
    
    {\displaystyle {\tilde {\rho }}.}
  
の テンソル積 を構成する。こうして
  
    
      
        
          G
          
            j
          
        
        .
      
    
    {\displaystyle G_{j}.}
  
の既約表現
  
    
      
        
          χ
          
            j
          
        
        ⊗
        
          
            
              ρ
              ~
            
          
        
      
    
    {\displaystyle \chi _{j}\otimes {\tilde {\rho }}}
  
が得られる。

G
      
    
    {\displaystyle G}
  
の既約表現の分類を最終的に得るために、テンソル積
  
    
      
        
          χ
          
            j
          
        
        ⊗
        
          
            
              ρ
              ~
            
          
        
        .
      
    
    {\displaystyle \chi _{j}\otimes {\tilde {\rho }}.}
  
によって誘導される
  
    
      
        G
        ,
      
    
    {\displaystyle G,}
  
の表現
  
    
      
        
          θ
          
            j
            ,
            ρ
          
        
      
    
    {\displaystyle \theta _{j,\rho }}
  
を用いる。これにより、以下の結果が得られる。

- θ
          
            j
            ,
            ρ
          
        
      
    
    {\displaystyle \theta _{j,\rho }}
  
は既約である。
- θ
          
            j
            ,
            ρ
          
        
      
    
    {\displaystyle \theta _{j,\rho }}
  
と
  
    
      
        
          θ
          
            
              j
              ′
            
            ,
            
              ρ
              ′
            
          
        
      
    
    {\displaystyle \theta _{j',\rho '}}
  
が同型であれば、
  
    
      
        j
        =
        
          j
          ′
        
      
    
    {\displaystyle j=j'}
  
も同型であり、さらに
  
    
      
        ρ
      
    
    {\displaystyle \rho }
  
は
  
    
      
        
          ρ
          ′
        
        .
      
    
    {\displaystyle \rho '.}
  
と同型である。
- G
      
    
    {\displaystyle G}
  
のすべての既約表現は、
  
    
      
        
          θ
          
            j
            ,
            ρ
          
        
        .
      
    
    {\displaystyle \theta _{j,\rho }.}
  
のいずれかと同型である。
命題の証明には、とりわけマッキーの判定法とフロベニウス相互律に基づく結論が必要である。詳細は[1]を参照のこと。

言い換えれば、
  
    
      
        G
        =
        A
        ⋊
        H
        .
      
    
    {\displaystyle G=A\rtimes H.}
  
のすべての既約表現を分類したことになる。

## 表現環

G
      
    
    {\displaystyle G}
  
の表現環は、可換群として定義される。

テンソル積によって与えられる乗法により、
  
    
      
        R
        (
        G
        )
      
    
    {\displaystyle R(G)}
  
は環となる。
  
    
      
        R
        (
        G
        )
      
    
    {\displaystyle R(G)}
  
の元は仮想表現と呼ばれる。

指標は、
  
    
      
        G
      
    
    {\displaystyle G}
  
上の複素数値をとるすべての類関数の集合における環準同型を定義する。

ここで、
  
    
      
        
          χ
          
            j
          
        
      
    
    {\displaystyle \chi _{j}}
  
は
  
    
      
        
          τ
          
            j
          
        
        .
      
    
    {\displaystyle \tau _{j}.}
  
に対応する既約指標である。

表現はその指標によって決定されるため、
  
    
      
        χ
      
    
    {\displaystyle \chi }
  
は単射である。
  
    
      
        χ
      
    
    {\displaystyle \chi }
  
の像は仮想指標と呼ばれる。

既約指標は
  
    
      
        
          
            C
          
          
            class
          
        
        ,
        χ
      
    
    {\displaystyle \mathbb {C} _{\text{class}},\chi }
  
の正規直交基底を形成するため、同型写像が誘導される。

この同型写像は、基本テンソルからなる基底上で定義される。
  
    
      
        (
        
          τ
          
            j
          
        
        ⊗
        1
        
          )
          
            j
            =
            1
            ,
            …
            ,
            m
          
        
      
    
    {\displaystyle (\tau _{j}\otimes 1)_{j=1,\ldots ,m}}
  
によって、それぞれ
  
    
      
        
          χ
          
            
              C
            
          
        
        (
        
          τ
          
            j
          
        
        ⊗
        1
        )
        =
        
          χ
          
            j
          
        
      
    
    {\displaystyle \chi _{\mathbb {C} }(\tau _{j}\otimes 1)=\chi _{j}}
  

  
    
      
        
          χ
          
            
              C
            
          
        
        (
        
          τ
          
            j
          
        
        ⊗
        z
        )
        =
        z
        
          χ
          
            j
          
        
        ,
      
    
    {\displaystyle \chi _{\mathbb {C} }(\tau _{j}\otimes z)=z\chi _{j},}
  
であり、双線形に拡張される。

G
      
    
    {\displaystyle G}
  
のすべての指標の集合を
  
    
      
        
          
            
              R
            
          
          
            +
          
        
        (
        G
        )
      
    
    {\displaystyle {\mathcal {R}}^{+}(G)}
  
と書き、
  
    
      
        
          
            
              R
            
          
          
            +
          
        
        (
        G
        )
        ,
      
    
    {\displaystyle {\mathcal {R}}^{+}(G),}
  
によって生成される群、すなわち2つの指標の差の集合を
  
    
      
        
          
            R
          
        
        (
        G
        )
      
    
    {\displaystyle {\mathcal {R}}(G)}
  
と表記する。このとき、
  
    
      
        
          
            R
          
        
        (
        G
        )
        =
        
          Z
        
        
          χ
          
            1
          
        
        ⊕
        ⋯
        ⊕
        
          Z
        
        
          χ
          
            m
          
        
      
    
    {\displaystyle {\mathcal {R}}(G)=\mathbb {Z} \chi _{1}\oplus \cdots \oplus \mathbb {Z} \chi _{m}}
  
および
  
    
      
        
          
            R
          
        
        (
        G
        )
        =
        
          Im
        
        (
        χ
        )
        =
        χ
        (
        R
        (
        G
        )
        )
        .
      
    
    {\displaystyle {\mathcal {R}}(G)={\text{Im}}(\chi )=\chi (R(G)).}
  
が成り立つ。したがって、
  
    
      
        R
        (
        G
        )
        ≅
        
          
            R
          
        
        (
        G
        )
      
    
    {\displaystyle R(G)\cong {\mathcal {R}}(G)}
  
が得られ、仮想指標は仮想表現と最適な形で対応する。

R
          
        
        (
        G
        )
        =
        
          Im
        
        (
        χ
        )
      
    
    {\displaystyle {\mathcal {R}}(G)={\text{Im}}(\chi )}
  
が成り立つため、
  
    
      
        
          
            R
          
        
        (
        G
        )
      
    
    {\displaystyle {\mathcal {R}}(G)}
  
はすべての仮想指標の集合である。2つの指標の積は別の指標を与えるため、
  
    
      
        
          
            R
          
        
        (
        G
        )
      
    
    {\displaystyle {\mathcal {R}}(G)}
  
は
  
    
      
        G
        .
      
    
    {\displaystyle G.}
  
上のすべての類関数の環
  
    
      
        
          
            C
          
          
            class
          
        
        (
        G
        )
      
    
    {\displaystyle \mathbb {C} _{\text{class}}(G)}
  
の部分環となる。
  
    
      
        
          χ
          
            i
          
        
      
    
    {\displaystyle \chi _{i}}
  
が
  
    
      
        
          
            C
          
          
            class
          
        
        (
        G
        )
      
    
    {\displaystyle \mathbb {C} _{\text{class}}(G)}
  
の基底をなすため、
  
    
      
        R
        (
        G
        )
        ,
      
    
    {\displaystyle R(G),}
  
の場合と同様に、同型
  
    
      
        
          C
        
        ⊗
        
          
            R
          
        
        (
        G
        )
        ≅
        
          
            C
          
          
            class
          
        
        (
        G
        )
        .
      
    
    {\displaystyle \mathbb {C} \otimes {\mathcal {R}}(G)\cong \mathbb {C} _{\text{class}}(G).}
  
が得られる。

G
        .
      
    
    {\displaystyle G.}
  
の部分群を
  
    
      
        H
      
    
    {\displaystyle H}
  
とする。制限は環準同型
  
    
      
        
          
            R
          
        
        (
        G
        )
        →
        
          
            R
          
        
        (
        H
        )
        ,
        ϕ
        ↦
        ϕ
        
          
            |
          
          
            H
          
        
        ,
      
    
    {\displaystyle {\mathcal {R}}(G)\to {\mathcal {R}}(H),\phi \mapsto \phi |_{H},}
  
を定義し、これは
  
    
      
        
          
            Res
          
          
            H
          
          
            G
          
        
      
    
    {\displaystyle {\text{Res}}_{H}^{G}}
  
または
  
    
      
        
          Res
        
        .
      
    
    {\displaystyle {\text{Res}}.}
  
と表記される。同様に、類関数上の誘導はアーベル群の準同型
  
    
      
        
          
            R
          
        
        (
        H
        )
        →
        
          
            R
          
        
        (
        G
        )
        ,
      
    
    {\displaystyle {\mathcal {R}}(H)\to {\mathcal {R}}(G),}
  
を定義し、これは
  
    
      
        
          
            Ind
          
          
            H
          
          
            G
          
        
      
    
    {\displaystyle {\text{Ind}}_{H}^{G}}
  
または短く
  
    
      
        
          Ind
        
        .
      
    
    {\displaystyle {\text{Ind}}.}
  
と書かれる。

フロベニウスの相互律によれば、これら2つの準同型は双線形形式
  
    
      
        ⟨
        ⋅
        ,
        ⋅
        
          ⟩
          
            H
          
        
      
    
    {\displaystyle \langle \cdot ,\cdot \rangle _{H}}
  
および
  
    
      
        ⟨
        ⋅
        ,
        ⋅
        
          ⟩
          
            G
          
        
        .
      
    
    {\displaystyle \langle \cdot ,\cdot \rangle _{G}.}
  
に関して随伴である。さらに、式
  
    
      
        
          Ind
        
        (
        φ
        ⋅
        
          Res
        
        (
        ψ
        )
        )
        =
        
          Ind
        
        (
        φ
        )
        ⋅
        ψ
      
    
    {\displaystyle {\text{Ind}}(\varphi \cdot {\text{Res}}(\psi ))={\text{Ind}}(\varphi )\cdot \psi }
  
は、
  
    
      
        
          Ind
        
        :
        
          
            R
          
        
        (
        H
        )
        →
        
          
            R
          
        
        (
        G
        )
      
    
    {\displaystyle {\text{Ind}}:{\mathcal {R}}(H)\to {\mathcal {R}}(G)}
  
の像が環
  
    
      
        
          
            R
          
        
        (
        G
        )
        .
      
    
    {\displaystyle {\mathcal {R}}(G).}
  
のイデアルであることを示している。

表現の制限により、写像
  
    
      
        
          Res
        
      
    
    {\displaystyle {\text{Res}}}
  
は
  
    
      
        R
        (
        G
        )
        ,
      
    
    {\displaystyle R(G),}
  
に対して同様に定義でき、誘導表現によって
  
    
      
        R
        (
        G
        )
        .
      
    
    {\displaystyle R(G).}
  
に対する写像
  
    
      
        
          Ind
        
      
    
    {\displaystyle {\text{Ind}}}
  
が得られる。フロベニウスの相互律により、これらの写像は互いに随伴であり、像
  
    
      
        
          Im
        
        (
        
          Ind
        
        )
        =
        
          Ind
        
        (
        R
        (
        H
        )
        )
      
    
    {\displaystyle {\text{Im}}({\text{Ind}})={\text{Ind}}(R(H))}
  
は環
  
    
      
        R
        (
        G
        )
        .
      
    
    {\displaystyle R(G).}
  
のイデアルであるという結果が得られる。

A
      
    
    {\displaystyle A}
  
が可換環である場合、準同型
  
    
      
        
          Res
        
      
    
    {\displaystyle {\text{Res}}}
  
および
  
    
      
        
          Ind
        
      
    
    {\displaystyle {\text{Ind}}}
  
は
  
    
      
        A
      
    
    {\displaystyle A}
  
線形写像に拡張できる。

ここで、
  
    
      
        
          η
          
            j
          
        
      
    
    {\displaystyle \eta _{j}}
  
は同型を除いて
  
    
      
        H
      
    
    {\displaystyle H}
  
のすべての既約表現である。

A
        =
        
          C
        
      
    
    {\displaystyle A=\mathbb {C} }
  
を用いると、特に
  
    
      
        
          Ind
        
      
    
    {\displaystyle {\text{Ind}}}
  
および
  
    
      
        
          Res
        
      
    
    {\displaystyle {\text{Res}}}
  
が
  
    
      
        
          
            C
          
          
            class
          
        
        (
        G
        )
      
    
    {\displaystyle \mathbb {C} _{\text{class}}(G)}
  
と
  
    
      
        
          
            C
          
          
            class
          
        
        (
        H
        )
        .
      
    
    {\displaystyle \mathbb {C} _{\text{class}}(H).}
  
の間の準同型を提供することがわかる。

2つの群
  
    
      
        
          G
          
            1
          
        
      
    
    {\displaystyle G_{1}}
  
および
  
    
      
        
          G
          
            2
          
        
      
    
    {\displaystyle G_{2}}
  
があり、それぞれ表現
  
    
      
        (
        
          ρ
          
            1
          
        
        ,
        
          V
          
            1
          
        
        )
      
    
    {\displaystyle (\rho _{1},V_{1})}
  
と
  
    
      
        (
        
          ρ
          
            2
          
        
        ,
        
          V
          
            2
          
        
        )
        .
      
    
    {\displaystyle (\rho _{2},V_{2}).}
  
を持つとする。このとき、
  
    
      
        
          ρ
          
            1
          
        
        ⊗
        
          ρ
          
            2
          
        
      
    
    {\displaystyle \rho _{1}\otimes \rho _{2}}
  
は、前節で示したように、直積群
  
    
      
        
          G
          
            1
          
        
        ×
        
          G
          
            2
          
        
      
    
    {\displaystyle G_{1}\times G_{2}}
  
の表現である。同節のもう一つの結果として、
  
    
      
        
          G
          
            1
          
        
        ×
        
          G
          
            2
          
        
      
    
    {\displaystyle G_{1}\times G_{2}}
  
のすべての既約表現は、正確に
  
    
      
        
          η
          
            1
          
        
        ⊗
        
          η
          
            2
          
        
        ,
      
    
    {\displaystyle \eta _{1}\otimes \eta _{2},}
  
という形をしている。ここで
  
    
      
        
          η
          
            1
          
        
      
    
    {\displaystyle \eta _{1}}
  
と
  
    
      
        
          η
          
            2
          
        
      
    
    {\displaystyle \eta _{2}}
  
はそれぞれ
  
    
      
        
          G
          
            1
          
        
      
    
    {\displaystyle G_{1}}
  
と
  
    
      
        
          G
          
            2
          
        
        ,
      
    
    {\displaystyle G_{2},}
  
の既約表現である。これは表現環において、以下の恒等式として引き継がれる。
  
    
      
        R
        (
        
          G
          
            1
          
        
        ×
        
          G
          
            2
          
        
        )
        =
        R
        (
        
          G
          
            1
          
        
        )
        
          ⊗
          
            
              Z
            
          
        
        R
        (
        
          G
          
            2
          
        
        )
        ,
      
    
    {\displaystyle R(G_{1}\times G_{2})=R(G_{1})\otimes _{\mathbb {Z} }R(G_{2}),}
  
ここで
  
    
      
        R
        (
        
          G
          
            1
          
        
        )
        
          ⊗
          
            
              Z
            
          
        
        R
        (
        
          G
          
            2
          
        
        )
      
    
    {\displaystyle R(G_{1})\otimes _{\mathbb {Z} }R(G_{2})}
  
は、表現環のテンソル積であり、
  
    
      
        
          Z
        
      
    
    {\displaystyle \mathbb {Z} }
  
加群としてのテンソル積である。

## 誘導定理

誘導定理は、与えられた有限群 G の表現環を、G のいくつかの部分群 H からなる族 X の表現環と関連付けるものである。より正確には、このような部分群の集合に対して、誘導関手は以下の写像を導く。

アルティンの誘導定理は、この種の結果の中で最も基本的な定理である。この定理は、以下の事柄が同値であることを主張する。

- φ
      
    
    {\displaystyle \varphi }
  
の余核が有限であること。
- G
      
    
    {\displaystyle G}
  
が
  
    
      
        X
        ,
      
    
    {\displaystyle X,}
  
に属する部分群の共役の和集合であること、すなわち
  
    
      
        G
        =
        
          ⋃
          
            
              
                H
                ∈
                X
              
              
                s
                ∈
                G
              
            
          
        
        s
        H
        
          s
          
            −
            1
          
        
        .
      
    
    {\displaystyle G=\bigcup _{H\in X \atop s\in G}sHs^{-1}.}
  
であること。
R
          
        
        (
        G
        )
      
    
    {\displaystyle {\mathcal {R}}(G)}
  
は群として有限生成であるため、最初の点は次のように言い換えることができる。

- G
        ,
      
    
    {\displaystyle G,}
  
の各指標
  
    
      
        χ
      
    
    {\displaystyle \chi }
  
に対して、ある仮想指標
  
    
      
        
          χ
          
            H
          
        
        ∈
        
          
            R
          
        
        (
        H
        )
        ,
        
        H
        ∈
        X
      
    
    {\displaystyle \chi _{H}\in {\mathcal {R}}(H),\,H\in X}
  
と整数
  
    
      
        d
        ≥
        1
        ,
      
    
    {\displaystyle d\geq 1,}
  
が存在し、
  
    
      
        d
        ⋅
        χ
        =
        
          ∑
          
            H
            ∈
            X
          
        
        
          
            Ind
          
          
            H
          
          
            G
          
        
        (
        
          χ
          
            H
          
        
        )
        .
      
    
    {\displaystyle d\cdot \chi =\sum _{H\in X}{\text{Ind}}_{H}^{G}(\chi _{H}).}
  
が成り立つ。
Serre (1977)はこの定理の2つの証明を与えている。例えば、Gはその巡回部分群の和集合であるため、
  
    
      
        G
      
    
    {\displaystyle G}
  
のすべての指標は、巡回部分群の指標から誘導された指標の、有理数係数の線形結合である。
  
    
      
        G
        .
      
    
    {\displaystyle G.}
  
の。巡回群の表現はよく理解されており、特に既約表現は1次元であるため、これによりGの表現がある程度制御されることになる。

上記の状況下では、
  
    
      
        φ
      
    
    {\displaystyle \varphi }
  
が全射であるとは一般には言えない。ブラウアーの誘導定理 は、X がすべての 素部分群 の族であるならば、
  
    
      
        φ
      
    
    {\displaystyle \varphi }
  
は全射であると主張する。ここで、ある素数 p が存在して、群 H が
  
    
      
        p
      
    
    {\displaystyle p}
  
と互いに素な位数の 巡回群 と 直積 をなす場合、H は 素 であるという。
  
    
      
        p
      
    
    {\displaystyle p}
  
群。言い換えれば、
  
    
      
        G
      
    
    {\displaystyle G}
  
のすべての 指標 は、素部分群の指標によって誘導された指標の整数係数線形結合である。ブラウアーの定理に現れる素部分群 H は、巡回群よりも豊かな表現論を持ち、少なくともそのような H の任意の既約表現は、ある（必然的に同じく素である）部分群
  
    
      
        K
        ⊂
        H
      
    
    {\displaystyle K\subset H}
  
の1次元表現によって誘導されるという性質を持つ。（この後者の性質は、任意の（超可解群。これには冪零群、特に初等群が含まれる。）次数1の表現から表現を誘導するこの能力は、有限群の表現論においてさらなる帰結をもたらす。

## 実表現

C
        
      
    
    {\displaystyle \mathbb {C} }
  
の一般的な部分体上の表現に関する証明や詳細については、[2]を参照されたい。

群
  
    
      
        G
      
    
    {\displaystyle G}
  
が実ベクトル空間
  
    
      
        
          V
          
            0
          
        
        ,
      
    
    {\displaystyle V_{0},}
  
に作用する場合、複素ベクトル空間
  
    
      
        V
        =
        
          V
          
            0
          
        
        
          ⊗
          
            
              R
            
          
        
        
          C
        
      
    
    {\displaystyle V=V_{0}\otimes _{\mathbb {R} }\mathbb {C} }
  
上の対応する表現を実表現と呼ぶ（
  
    
      
        V
      
    
    {\displaystyle V}
  
は
  
    
      
        
          V
          
            0
          
        
      
    
    {\displaystyle V_{0}}
  
の複素化と呼ばれる）。上述の対応する表現は、すべての
  
    
      
        s
        ∈
        G
        ,
        
          v
          
            0
          
        
        ∈
        
          V
          
            0
          
        
        ,
        z
        ∈
        
          C
        
        .
      
    
    {\displaystyle s\in G,v_{0}\in V_{0},z\in \mathbb {C} .}
  
に対して
  
    
      
        s
        ⋅
        (
        
          v
          
            0
          
        
        ⊗
        z
        )
        =
        (
        s
        ⋅
        
          v
          
            0
          
        
        )
        ⊗
        z
      
    
    {\displaystyle s\cdot (v_{0}\otimes z)=(s\cdot v_{0})\otimes z}
  
で与えられる。

ρ
      
    
    {\displaystyle \rho }
  
を実表現とする。線形写像
  
    
      
        ρ
        (
        s
        )
      
    
    {\displaystyle \rho (s)}
  
は、すべての
  
    
      
        s
        ∈
        G
        .
      
    
    {\displaystyle s\in G.}
  
に対して
  
    
      
        
          R
        
      
    
    {\displaystyle \mathbb {R} }
  
値をとる。したがって、実表現の指標は常に実数値をとると結論付けられる。しかし、実数値指標を持つすべての表現が実表現であるとは限らない。これを明確にするために、
  
    
      
        G
      
    
    {\displaystyle G}
  
を群の有限非可換部分群とする。

このとき
  
    
      
        G
        ⊂
        
          SU
        
        (
        2
        )
      
    
    {\displaystyle G\subset {\text{SU}}(2)}
  
は
  
    
      
        V
        =
        
          
            C
          
          
            2
          
        
        .
      
    
    {\displaystyle V=\mathbb {C} ^{2}.}
  
に作用する。
  
    
      
        
          SU
        
        (
        2
        )
      
    
    {\displaystyle {\text{SU}}(2)}
  
内の任意の行列のトレースは実数であるため、表現の指標は実数値をとる。
  
    
      
        ρ
      
    
    {\displaystyle \rho }
  
が実表現であると仮定すると、
  
    
      
        ρ
        (
        G
        )
      
    
    {\displaystyle \rho (G)}
  
は実数値行列のみから構成されることになる。したがって、
  
    
      
        G
        ⊂
        
          SU
        
        (
        2
        )
        ∩
        
          
            GL
          
          
            2
          
        
        (
        
          R
        
        )
        =
        
          SO
        
        (
        2
        )
        =
        
          S
          
            1
          
        
        .
      
    
    {\displaystyle G\subset {\text{SU}}(2)\cap {\text{GL}}_{2}(\mathbb {R} )={\text{SO}}(2)=S^{1}.}
  
となる。しかし、円周群はアーベル群であるが、
  
    
      
        G
      
    
    {\displaystyle G}
  
は非アーベル群として選ばれた。今、
  
    
      
        
          SU
        
        (
        2
        )
        .
      
    
    {\displaystyle {\text{SU}}(2).}
  
の非アーベル有限部分群の存在を証明するだけでよい。そのような群を見つけるために、
  
    
      
        
          SU
        
        (
        2
        )
      
    
    {\displaystyle {\text{SU}}(2)}
  
は 四元数 の単元と同一視できることに注目する。ここで
  
    
      
        G
        =
        {
        ±
        1
        ,
        ±
        i
        ,
        ±
        j
        ,
        ±
        i
        j
        }
        .
      
    
    {\displaystyle G=\{\pm 1,\pm i,\pm j,\pm ij\}.}
  
とする。
  
    
      
        G
      
    
    {\displaystyle G}
  
の以下の2次元表現は実数値ではないが、実数値の指標を持つ：

このとき、
  
    
      
        ρ
      
    
    {\displaystyle \rho }
  
の像は実数値ではないが、それにもかかわらずそれは
  
    
      
        
          SU
        
        (
        2
        )
        .
      
    
    {\displaystyle {\text{SU}}(2).}
  
の部分集合である。したがって、その表現の指標は実数である。

実ベクトル空間上の
  
    
      
        G
      
    
    {\displaystyle G}
  
の既約表現は、体を
  
    
      
        
          C
        
        .
      
    
    {\displaystyle \mathbb {C} .}
  
に拡大すると可約になることがある。例えば、巡回群の以下の実表現は、
  
    
      
        
          C
        
      
    
    {\displaystyle \mathbb {C} }
  
上で考えると可約である。

したがって、
  
    
      
        
          C
        
        ,
      
    
    {\displaystyle \mathbb {C} ,}
  
上で実であるすべての既約表現を分類したとしても、すべての既約実表現を分類したことにはならない。しかし、以下のことが達成される。

V
          
            0
          
        
      
    
    {\displaystyle V_{0}}
  
を実ベクトル空間とする。
  
    
      
        G
      
    
    {\displaystyle G}
  
が
  
    
      
        
          V
          
            0
          
        
      
    
    {\displaystyle V_{0}}
  
に既約に作用し、
  
    
      
        V
        =
        
          V
          
            0
          
        
        ⊗
        
          C
        
        .
      
    
    {\displaystyle V=V_{0}\otimes \mathbb {C} .}
  
であるとする。もし
  
    
      
        V
      
    
    {\displaystyle V}
  
が既約でなければ、正確に2つの既約因子が存在し、それらは
  
    
      
        G
        .
      
    
    {\displaystyle G.}
  
の複素共役表現である。

定義。四元数的表現とは、
  
    
      
        G
      
    
    {\displaystyle G}
  
不変な反線形準同型写像を持つ（複素）表現
  
    
      
        V
        ,
      
    
    {\displaystyle V,}
  
のことである。
  
    
      
        J
        :
        V
        →
        V
      
    
    {\displaystyle J:V\to V}
  
は
  
    
      
        
          J
          
            2
          
        
        =
        −
        
          Id
        
        .
      
    
    {\displaystyle J^{2}=-{\text{Id}}.}
  
を満たす。したがって、歪対称で非退化な
  
    
      
        G
      
    
    {\displaystyle G}
  
不変双線形形式は、
  
    
      
        V
        .
      
    
    {\displaystyle V.}
  
上に四元数的構造を定義する。

## 特定の群の表現

### 対称群

対称群
  
    
      
        
          S
          
            n
          
        
      
    
    {\displaystyle S_{n}}
  
の表現は、集中的に研究されてきた。
  
    
      
        
          S
          
            n
          
        
      
    
    {\displaystyle S_{n}}
  
における共役類（したがって、上記より既約表現）は、nの分割に対応する。例えば、
  
    
      
        
          S
          
            3
          
        
      
    
    {\displaystyle S_{3}}
  
は3つの既約表現を持ち、それらは以下の分割に対応する。

3の分割について、ヤング図形はその分割を描写する図形的な道具である。そのような分割（またはヤング図形）に対応する既約表現はスペヒト加群と呼ばれる。

異なる対称群の表現は関連している。
  
    
      
        
          S
          
            n
          
        
        ×
        
          S
          
            m
          
        
      
    
    {\displaystyle S_{n}\times S_{m}}
  
の任意の表現は、誘導によって
  
    
      
        
          S
          
            n
            +
            m
          
        
      
    
    {\displaystyle S_{n+m}}
  
の表現を生じ、その逆も制限によって成り立つ。これらすべての表現環の直和は、

これらの構成から、ホップ代数の構造を継承する。これは対称関数と密接に関連していることが判明している。

### リー型の有限群

ある程度まで、nが変化する際の
  
    
      
        G
        
          L
          
            n
          
        
        (
        
          
            F
          
          
            q
          
        
        )
      
    
    {\displaystyle GL_{n}(\mathbf {F} _{q})}
  
の表現は、
  
    
      
        
          S
          
            n
          
        
      
    
    {\displaystyle S_{n}}
  
の場合と同様の性質を持つ。前述の誘導過程は、いわゆる放物型誘導に置き換わる。しかし、すべての表現が自明な表現の誘導によって得られる
  
    
      
        
          S
          
            n
          
        
      
    
    {\displaystyle S_{n}}
  
とは異なり、
  
    
      
        G
        
          L
          
            n
          
        
        (
        
          
            F
          
          
            q
          
        
        )
      
    
    {\displaystyle GL_{n}(\mathbf {F} _{q})}
  
についてはこれが当てはまらない。代わりに、カスプ表現として知られる新たな構成要素が必要となる。

G
        
          L
          
            n
          
        
        (
        
          
            F
          
          
            q
          
        
        )
      
    
    {\displaystyle GL_{n}(\mathbf {F} _{q})}
  
の表現、より一般にはリー型の有限群の表現は、徹底的に研究されてきた。Bonnafé (2010)は、
  
    
      
        S
        
          L
          
            2
          
        
        (
        
          
            F
          
          
            q
          
        
        )
      
    
    {\displaystyle SL_{2}(\mathbf {F} _{q})}
  
の表現を記述している。前述のカスプ表現を含むこれらの群の既約表現の幾何学的な記述は、Deligne-Lusztig理論によって得られる。これは、Deligne-Lusztig多様体のl進コホモロジーにおいて、そのような表現を構成するものである。

S
          
            n
          
        
      
    
    {\displaystyle S_{n}}
  
と
  
    
      
        G
        
          L
          
            n
          
        
        (
        
          
            F
          
          
            q
          
        
        )
      
    
    {\displaystyle GL_{n}(\mathbf {F} _{q})}
  
の表現論の類似性は、有限群の枠組みを超えている。カスプ形式の哲学は、これらの型の群の表現論的側面と、Qpのような局所体上の一般線形群との親和性を強調する。また、アデール環との親和性についても、Bump (2004)を参照されたい。

## 展望—コンパクト群の表現

コンパクト群の表現論は、ある程度まで局所コンパクト群に拡張することができる。この文脈において、表現論は調和解析や保型形式の研究において大きな重要性を発揮する。証明や詳細な情報、本章の範囲を超えるより深い洞察については、 [4]および [5]を参照のこと。

### 定義と性質

位相群とは、群演算および逆元が連続であるような位相を備えた群である。そのような群は、コンパクトであると呼ばれる。すなわち、
  
    
      
        G
        ,
      
    
    {\displaystyle G,}
  
の開被覆が有限部分被覆を持つ場合である。コンパクト群の閉部分群は、再びコンパクトとなる。

G
      
    
    {\displaystyle G}
  
をコンパクト群、
  
    
      
        V
      
    
    {\displaystyle V}
  
を有限次元
  
    
      
        
          C
        
      
    
    {\displaystyle \mathbb {C} }
  
ベクトル空間とする。
  
    
      
        G
      
    
    {\displaystyle G}
  
から
  
    
      
        V
      
    
    {\displaystyle V}
  
への線形表現とは、連続群準同型
  
    
      
        ρ
        :
        G
        →
        
          GL
        
        (
        V
        )
        ,
      
    
    {\displaystyle \rho :G\to {\text{GL}}(V),}
  
のことである。すなわち、
  
    
      
        ρ
        (
        s
        )
        v
      
    
    {\displaystyle \rho (s)v}
  
は
  
    
      
        s
        ∈
        G
      
    
    {\displaystyle s\in G}
  
と
  
    
      
        v
        ∈
        V
        .
      
    
    {\displaystyle v\in V.}
  
の2変数に関する連続関数である。

G
      
    
    {\displaystyle G}
  
からバナッハ空間
  
    
      
        V
      
    
    {\displaystyle V}
  
への線形表現とは、
  
    
      
        G
      
    
    {\displaystyle G}
  
からすべての全単射な有界線形作用素の集合への連続な群準同型として定義される。
  
    
      
        V
      
    
    {\displaystyle V}
  
上の連続な逆写像を持つものについてである。
  
    
      
        π
        (
        g
        
          )
          
            −
            1
          
        
        =
        π
        (
        
          g
          
            −
            1
          
        
        )
        ,
      
    
    {\displaystyle \pi (g)^{-1}=\pi (g^{-1}),}
  
であるため、最後の要件は省略可能である。以下では、特にヒルベルト空間におけるコンパクト群の表現を考察する。

有限群の場合と同様に、群代数および畳み込み代数を定義することができる。しかし、群代数は無限群の場合には有益な情報を提供しない。なぜなら、構成の過程で連続性の条件が失われてしまうからである。その代わりに、畳み込み代数
  
    
      
        
          L
          
            1
          
        
        (
        G
        )
      
    
    {\displaystyle L^{1}(G)}
  
がその役割を果たす。

有限群の表現に関するほとんどの性質は、適切な変更を加えることでコンパクト群に引き継ぐことができる。そのためには、有限群における和に相当するものが必要となる。

### ハール測度の存在と一意性

コンパクト群
  
    
      
        G
      
    
    {\displaystyle G}
  
上には、ただ一つの測度が存在する。
  
    
      
        d
        t
        ,
      
    
    {\displaystyle dt,}
  
は以下の性質を満たす。

- 左不変測度であること
- 群全体が単位測度を持つこと
このような左不変な正規化測度は、群
  
    
      
        G
        .
      
    
    {\displaystyle G.}
  
のハール測度と呼ばれる。

G
      
    
    {\displaystyle G}
  
はコンパクトであるため、この測度が右不変でもあること、すなわち以下のことも成り立つことが示せる。

上記の正規化により、有限群上のハール測度はすべての
  
    
      
        s
        ∈
        G
        .
      
    
    {\displaystyle s\in G.}
  
に対して
  
    
      
        d
        t
        (
        s
        )
        =
        
          
            
              1
              
                
                  |
                
                G
                
                  |
                
              
            
          
        
      
    
    {\displaystyle dt(s)={\tfrac {1}{|G|}}}
  
で与えられる。

「性質」の節で言及された有限群の表現に対するすべての定義は、コンパクト群の表現にも適用される。しかし、いくつかの修正が必要である。

部分表現を定義するには、閉部分空間が必要となる。有限次元表現空間ではすべての部分空間がすでに閉じているため、これは必要ではなかった。さらに、コンパクト群
  
    
      
        G
      
    
    {\displaystyle G}
  
の2つの表現
  
    
      
        ρ
        ,
        π
      
    
    {\displaystyle \rho ,\pi }
  
は、表現空間の間に、逆写像も連続であり、かつすべての
  
    
      
        s
        ∈
        G
        .
      
    
    {\displaystyle s\in G.}
  
に対して
  
    
      
        T
        ∘
        ρ
        (
        s
        )
        =
        π
        (
        s
        )
        ∘
        T
      
    
    {\displaystyle T\circ \rho (s)=\pi (s)\circ T}
  
を満たす全単射な連続線形作用素
  
    
      
        T
      
    
    {\displaystyle T}
  
が存在する場合、同値であると呼ばれる。

T
      
    
    {\displaystyle T}
  
がユニタリである場合、その2つの表現はユニタリ同値と呼ばれる。

ある
  
    
      
        G
      
    
    {\displaystyle G}
  
不変な内積を、そうでないものから得るためには、
  
    
      
        G
      
    
    {\displaystyle G}
  
不変ではないものから、和の代わりに
  
    
      
        G
      
    
    {\displaystyle G}
  
上の積分を用いなければならない。もし
  
    
      
        (
        ⋅
        
          |
        
        ⋅
        )
      
    
    {\displaystyle (\cdot |\cdot )}
  
がヒルベルト空間
  
    
      
        V
        ,
      
    
    {\displaystyle V,}
  
上の内積であり、それが表現
  
    
      
        ρ
      
    
    {\displaystyle \rho }
  
に関する
  
    
      
        G
        ,
      
    
    {\displaystyle G,}
  
の不変内積でないならば、そのとき

は、
  
    
      
        G
      
    
    {\displaystyle G}
  
不変な内積である。
  
    
      
        V
      
    
    {\displaystyle V}
  
は、ハール測度の性質によるものである。
  
    
      
        d
        t
        .
      
    
    {\displaystyle dt.}
  
したがって、ヒルベルト空間上のすべての表現はユニタリであると仮定できる。

G
      
    
    {\displaystyle G}
  
をコンパクト群とし、
  
    
      
        s
        ∈
        G
        .
      
    
    {\displaystyle s\in G.}
  
とする。
  
    
      
        
          L
          
            2
          
        
        (
        G
        )
      
    
    {\displaystyle L^{2}(G)}
  
を
  
    
      
        G
        .
      
    
    {\displaystyle G.}
  
上の二乗可積分関数のヒルベルト空間とする。この空間上の作用素
  
    
      
        
          L
          
            s
          
        
      
    
    {\displaystyle L_{s}}
  
を、
  
    
      
        Φ
        ∈
        
          L
          
            2
          
        
        (
        G
        )
        ,
        t
        ∈
        G
        .
      
    
    {\displaystyle \Phi \in L^{2}(G),t\in G.}
  
として
  
    
      
        
          L
          
            s
          
        
        Φ
        (
        t
        )
        =
        Φ
        (
        
          s
          
            −
            1
          
        
        t
        )
        ,
      
    
    {\displaystyle L_{s}\Phi (t)=\Phi (s^{-1}t),}
  
により定義する。

写像
  
    
      
        s
        ↦
        
          L
          
            s
          
        
      
    
    {\displaystyle s\mapsto L_{s}}
  
は
  
    
      
        G
        .
      
    
    {\displaystyle G.}
  
のユニタリ表現であり、左正則表現と呼ばれる。右正則表現も同様に定義される。
  
    
      
        G
      
    
    {\displaystyle G}
  
のハール測度は右不変でもあるため、
  
    
      
        
          L
          
            2
          
        
        (
        G
        )
      
    
    {\displaystyle L^{2}(G)}
  
上の演算子
  
    
      
        
          R
          
            s
          
        
      
    
    {\displaystyle R_{s}}
  
は
  
    
      
        
          R
          
            s
          
        
        Φ
        (
        t
        )
        =
        Φ
        (
        t
        s
        )
        .
      
    
    {\displaystyle R_{s}\Phi (t)=\Phi (ts).}
  
によって与えられる。右正則表現は、
  
    
      
        s
        ↦
        
          R
          
            s
          
        
        .
      
    
    {\displaystyle s\mapsto R_{s}.}
  
によって与えられるユニタリ表現である。2つの表現
  
    
      
        s
        ↦
        
          L
          
            s
          
        
      
    
    {\displaystyle s\mapsto L_{s}}
  
と
  
    
      
        s
        ↦
        
          R
          
            s
          
        
      
    
    {\displaystyle s\mapsto R_{s}}
  
は互いに双対である。

G
      
    
    {\displaystyle G}
  
が無限群である場合、これらの表現は有限の次数を持たない。冒頭で定義した左および右正則表現は、群
  
    
      
        G
      
    
    {\displaystyle G}
  
が有限であれば、上記で定義した左および右正則表現と同型である。これは、この場合に
  
    
      
        
          L
          
            2
          
        
        (
        G
        )
        ≅
        
          L
          
            1
          
        
        (
        G
        )
        ≅
        
          C
        
        [
        G
        ]
        .
      
    
    {\displaystyle L^{2}(G)\cong L^{1}(G)\cong \mathbb {C} [G].}
  
が成り立つためである。

### 構成と分解

与えられた表現から新しい表現を構成する様々な方法は、後述する双対表現を除いて、コンパクト群に対しても同様に用いることができる。直和およびテンソル積は、有限個の項や因子を持つ場合、有限群の場合と全く同じように定義される。これは対称積や交代積についても同様である。しかし、直積上のハール測度が必要となる。2つの群の直積の既約表現が（同型を除いて）因子群の既約表現のテンソル積と正確に一致するという定理を拡張するためには、コンパクト群の直積上のハール測度が必要である。まず、2つのコンパクト群の直積
  
    
      
        
          G
          
            1
          
        
        ×
        
          G
          
            2
          
        
      
    
    {\displaystyle G_{1}\times G_{2}}
  
は、積位相を備えることで再びコンパクト群となることに注意する。その場合、直積上のハール測度は、因子群上のハール測度の積として与えられる。

コンパクト群上の双対表現には、ベクトル空間
  
    
      
        V
        .
      
    
    {\displaystyle V.}
  
の位相的双対
  
    
      
        
          V
          ′
        
      
    
    {\displaystyle V'}
  
が必要となる。これは、ベクトル空間
  
    
      
        V
      
    
    {\displaystyle V}
  
から基礎体へのすべての連続線形汎関数のベクトル空間である。
  
    
      
        G
      
    
    {\displaystyle G}
  
の
  
    
      
        V
        .
      
    
    {\displaystyle V.}
  
におけるコンパクト群の表現を
  
    
      
        π
      
    
    {\displaystyle \pi }
  
とする。

双対表現
  
    
      
        
          π
          ′
        
        :
        G
        →
        
          GL
        
        (
        
          V
          ′
        
        )
      
    
    {\displaystyle \pi ':G\to {\text{GL}}(V')}
  
は、以下の性質によって定義される。

したがって、双対表現はすべての
  
    
      
        
          π
          ′
        
        (
        s
        )
        
          v
          ′
        
        =
        
          v
          ′
        
        ∘
        π
        (
        
          s
          
            −
            1
          
        
        )
      
    
    {\displaystyle \pi '(s)v'=v'\circ \pi (s^{-1})}
  
に対して与えられると結論付けられる
  
    
      
        
          v
          ′
        
        ∈
        
          V
          ′
        
        ,
        s
        ∈
        G
        .
      
    
    {\displaystyle v'\in V',s\in G.}
  
写像
  
    
      
        
          π
          ′
        
      
    
    {\displaystyle \pi '}
  
は再び連続な群準同型であり、したがって表現である

ヒルベルト空間について：
  
    
      
        π
      
    
    {\displaystyle \pi }
  
が既約であるための必要十分条件は
  
    
      
        
          π
          ′
        
      
    
    {\displaystyle \pi '}
  
が既約であることである

分解の節の結果をコンパクト群に転用することで、以下の定理が得られる。

コンパクト群のすべての表現は、既約表現のヒルベルト直和と同型である。

(
        ρ
        ,
        
          V
          
            ρ
          
        
        )
      
    
    {\displaystyle (\rho ,V_{\rho })}
  
をコンパクト群のユニタリ表現とする。
  
    
      
        G
        .
      
    
    {\displaystyle G.}
  
有限群の場合と同様に、既約表現に対して次のように定義する。
  
    
      
        (
        τ
        ,
        
          V
          
            τ
          
        
        )
      
    
    {\displaystyle (\tau ,V_{\tau })}
  
におけるアイソタイプ（isotype）またはアイソタイプ成分（isotypic component）を
  
    
      
        ρ
      
    
    {\displaystyle \rho }
  
次のような部分空間とする。

これは、
  
    
      
        
          V
          
            τ
          
        
        .
      
    
    {\displaystyle V_{\tau }.}
  
と
  
    
      
        G
      
    
    {\displaystyle G}
  
-同型であるすべての不変閉部分空間
  
    
      
        U
        ,
      
    
    {\displaystyle U,}
  
の和である

同値でない既約表現のアイソタイプは互いに直交することに注意せよ

対応する標準分解
  
    
      
        
          p
          
            τ
          
        
        :
        V
        →
        V
        (
        τ
        )
        ,
      
    
    {\displaystyle p_{\tau }:V\to V(\tau ),}
  
への射影において、
  
    
      
        V
        (
        τ
        )
      
    
    {\displaystyle V(\tau )}
  
が同型類である場合、
  
    
      
        V
        ,
      
    
    {\displaystyle V,}
  
はコンパクト群に対して次のように与えられる。

ここで
  
    
      
        
          n
          
            τ
          
        
        =
        dim
        ⁡
        (
        V
        (
        τ
        )
        )
      
    
    {\displaystyle n_{\tau }=\dim(V(\tau ))}
  
であり、
  
    
      
        
          χ
          
            τ
          
        
      
    
    {\displaystyle \chi _{\tau }}
  
は既約表現
  
    
      
        τ
        .
      
    
    {\displaystyle \tau .}
  
に対応する指標である

#### 射影公式

コンパクト群の任意の表現
  
    
      
        (
        ρ
        ,
        V
        )
      
    
    {\displaystyle (\rho ,V)}
  
に対して
  
    
      
        G
      
    
    {\displaystyle G}
  
次のように定義する

一般に
  
    
      
        ρ
        (
        s
        )
        :
        V
        →
        V
      
    
    {\displaystyle \rho (s):V\to V}
  
はそうではない
  
    
      
        G
      
    
    {\displaystyle G}
  
線形である。一般に、

写像
  
    
      
        P
      
    
    {\displaystyle P}
  
は、自己準同型として定義される。
  
    
      
        V
      
    
    {\displaystyle V}
  
は、以下の性質を持つ。

これはヒルベルト空間
  
    
      
        V
        .
      
    
    {\displaystyle V.}
  
の内積に対して有効である。

そのとき
  
    
      
        P
      
    
    {\displaystyle P}
  
は、
  
    
      
        G
      
    
    {\displaystyle G}
  
線形である。なぜなら、

ここでハール測度の不変性を用いた。

表現が有限次元であれば、有限群の場合と同様に自明な部分表現の直和を決定することが可能である。

### 指標、シューアの補題、および内積

一般に、コンパクト群の表現はヒルベルト空間およびバナッハ空間上で研究される。多くの場合、それらは有限次元ではない。したがって、コンパクト群の表現について語る際に指標に言及することは有用ではない。それにもかかわらず、多くの場合、有限次元の場合に研究を制限することが可能である。

コンパクト群の既約表現は有限次元かつユニタリであるため（最初のサブセクションの結果を参照）、有限群の場合と同様の方法で既約指標を定義することができる。

構成された表現が有限次元である限り、新しく構成された表現の指標は有限群の場合と同じ方法で得られる。

シューアの補題はコンパクト群に対しても有効である。

(
        π
        ,
        V
        )
      
    
    {\displaystyle (\pi ,V)}
  
をコンパクト群
  
    
      
        G
        .
      
    
    {\displaystyle G.}
  
の既約ユニタリ表現とする。このとき、すべての
  
    
      
        s
        ∈
        G
        ,
      
    
    {\displaystyle s\in G,}
  
に対して
  
    
      
        T
        ∘
        π
        (
        s
        )
        =
        π
        (
        s
        )
        ∘
        T
      
    
    {\displaystyle T\circ \pi (s)=\pi (s)\circ T}
  
という性質を満たす任意の有界作用素
  
    
      
        T
        :
        V
        →
        V
      
    
    {\displaystyle T:V\to V}
  
は、恒等作用素のスカラー倍である。すなわち、
  
    
      
        T
        =
        λ
        
          Id
        
        .
      
    
    {\displaystyle T=\lambda {\text{Id}}.}
  
を満たす
  
    
      
        λ
        ∈
        
          C
        
      
    
    {\displaystyle \lambda \in \mathbb {C} }
  
が存在する。

コンパクト群のすべての二乗可積分関数
  
    
      
        
          L
          
            2
          
        
        (
        G
        )
      
    
    {\displaystyle L^{2}(G)}
  
の集合上の内積を定義する。
  
    
      
        G
        .
      
    
    {\displaystyle G.}
  
同様に、

コンパクト群
  
    
      
        G
        .
      
    
    {\displaystyle G.}
  
の
  
    
      
        
          L
          
            2
          
        
        (
        G
        )
      
    
    {\displaystyle L^{2}(G)}
  
上の双線形形式を定義する。

表現空間上の双線形形式は、有限群の場合と全く同様に定義され、有限群と類似して以下の結果が成立する。

- {
            
              
                
                  
                    ρ
                    
                      1
                    
                  
                  (
                  
                    0
                  
                  )
                  =
                  1
                
              
              
                
                  
                    ρ
                    
                      1
                    
                  
                  (
                  
                    1
                  
                  )
                  =
                  i
                
              
              
                
                  
                    ρ
                    
                      1
                    
                  
                  (
                  
                    2
                  
                  )
                  =
                  −
                  1
                
              
              
                
                  
                    ρ
                    
                      1
                    
                  
                  (
                  
                    3
                  
                  )
                  =
                  −
                  i
                
              
            
            
          
        
        
        
          
            {
            
              
                
                  
                    ρ
                    
                      2
                    
                  
                  (
                  
                    0
                  
                  )
                  =
                  1
                
              
              
                
                  
                    ρ
                    
                      2
                    
                  
                  (
                  
                    1
                  
                  )
                  =
                  −
                  1
                
              
              
                
                  
                    ρ
                    
                      2
                    
                  
                  (
                  
                    2
                  
                  )
                  =
                  1
                
              
              
                
                  
                    ρ
                    
                      2
                    
                  
                  (
                  
                    3
                  
                  )
                  =
                  −
                  1
                
              
            
            
          
        
        
        
          
            {
            
              
                
                  
                    ρ
                    
                      3
                    
                  
                  (
                  
                    0
                  
                  )
                  =
                  1
                
              
              
                
                  
                    ρ
                    
                      3
                    
                  
                  (
                  
                    1
                  
                  )
                  =
                  −
                  i
                
              
              
                
                  
                    ρ
                    
                      3
                    
                  
                  (
                  
                    2
                  
                  )
                  =
                  −
                  1
                
              
              
                
                  
                    ρ
                    
                      3
                    
                  
                  (
                  
                    3
                  
                  )
                  =
                  i
                
              
            
            
          
        
      
    
    {\displaystyle {\begin{cases}\rho _{1}({0})=1\\\rho _{1}({1})=i\\\rho _{1}({2})=-1\\\rho _{1}({3})=-i\end{cases}}\qquad {\begin{cases}\rho _{2}({0})=1\\\rho _{2}({1})=-1\\\rho _{2}({2})=1\\\rho _{2}({3})=-1\end{cases}}\qquad {\begin{cases}\rho _{3}({0})=1\\\rho _{3}({1})=-i\\\rho _{3}({2})=-1\\\rho _{3}({3})=i\end{cases}}}
- (
        χ
        
          |
        
        χ
        )
        =
        1
        ,
      
    
    {\displaystyle (\chi |\chi )=1,}
  
、すなわち
  
    
      
        χ
      
    
    {\displaystyle \chi }
  
は「ノルム」
  
    
      
        1.
      
    
    {\displaystyle 1.}
  
を持つ。
したがって、第一定理を用いると、
  
    
      
        G
      
    
    {\displaystyle G}
  
の既約表現の指標は、
  
    
      
        
          
            C
          
          
            class
          
        
        (
        G
        )
      
    
    {\displaystyle \mathbb {C} _{\text{class}}(G)}
  
上、この内積に関して正規直交系をなす。

- G
      
    
    {\displaystyle G}
  
はアーベル群である。
- G
      
    
    {\displaystyle G}
  
のすべての既約表現は次数
  
    
      
        1.
      
    
    {\displaystyle 1.}
  
を持つ。
同型でない既約表現が正規直交系であることはすでに知られているため、それらが
  
    
      
        
          L
          
            2
          
        
        (
        G
        )
        .
      
    
    {\displaystyle L^{2}(G).}
  
を生成することを確認すれば十分である。これは、
  
    
      
        G
      
    
    {\displaystyle G}
  
上のすべての既約指標と直交する非零の二乗可積分関数が存在しないことを証明することで達成される。

有限群の場合と同様に、群
  
    
      
        G
      
    
    {\displaystyle G}
  
の同型を除いた既約表現の数は、
  
    
      
        G
        .
      
    
    {\displaystyle G.}
  
の共役類の数に等しい。しかし、コンパクト群は一般に無限個の共役類を持つため、これからは有用な情報は得られない。

### 誘導表現

H
      
    
    {\displaystyle H}
  
がコンパクト群における有限指数の閉部分群である場合、
  
    
      
        G
        ,
      
    
    {\displaystyle G,}
  
有限群に対する誘導表現の定義を適用できる。

しかし、誘導表現はより一般的に定義することが可能であり、その定義は部分群
  
    
      
        H
        .
      
    
    {\displaystyle H.}
  
の指数に依存せず有効である。

この目的のために、閉部分群のユニタリ表現を
  
    
      
        (
        η
        ,
        
          V
          
            η
          
        
        )
      
    
    {\displaystyle (\eta ,V_{\eta })}
  
とする。
  
    
      
        H
        .
      
    
    {\displaystyle H.}
  
連続誘導表現
  
    
      
        
          
            Ind
          
          
            H
          
          
            G
          
        
        (
        η
        )
        =
        (
        I
        ,
        
          V
          
            I
          
        
        )
      
    
    {\displaystyle {\text{Ind}}_{H}^{G}(\eta )=(I,V_{I})}
  
は次のように定義される。

V
          
            I
          
        
      
    
    {\displaystyle V_{I}}
  
を、すべての可測かつ二乗可積分な関数のヒルベルト空間とする。
  
    
      
        Φ
        :
        G
        →
        
          V
          
            η
          
        
      
    
    {\displaystyle \Phi :G\to V_{\eta }}
  
は、以下の性質を持つ。
  
    
      
        Φ
        (
        l
        s
        )
        =
        η
        (
        l
        )
        Φ
        (
        s
        )
      
    
    {\displaystyle \Phi (ls)=\eta (l)\Phi (s)}
  
は、すべての
  
    
      
        l
        ∈
        H
        ,
        s
        ∈
        G
        .
      
    
    {\displaystyle l\in H,s\in G.}
  
ノルムは次のように与えられる。

そして、表現
  
    
      
        I
      
    
    {\displaystyle I}
  
は右移動として与えられる。
  
    
      
        I
        (
        s
        )
        Φ
        (
        k
        )
        =
        Φ
        (
        k
        s
        )
        .
      
    
    {\displaystyle I(s)\Phi (k)=\Phi (ks).}

誘導表現は、再びユニタリ表現となる。

G
      
    
    {\displaystyle G}
  
はコンパクトであるため、誘導表現は
  
    
      
        G
        .
      
    
    {\displaystyle G.}
  
の既約表現の直和に分解できる。同じアイソタイプに属するすべての既約表現は、
  
    
      
        dim
        ⁡
        (
        
          
            Hom
          
          
            G
          
        
        (
        
          V
          
            η
          
        
        ,
        
          V
          
            I
          
        
        )
        )
        =
        ⟨
        
          V
          
            η
          
        
        ,
        
          V
          
            I
          
        
        
          ⟩
          
            G
          
        
        .
      
    
    {\displaystyle \dim({\text{Hom}}_{G}(V_{\eta },V_{I}))=\langle V_{\eta },V_{I}\rangle _{G}.}
  
に等しい重複度で現れることに注意せよ。

(
        ρ
        ,
        
          V
          
            ρ
          
        
        )
      
    
    {\displaystyle (\rho ,V_{\rho })}
  
を表現とする。
  
    
      
        G
        ,
      
    
    {\displaystyle G,}
  
ならば、標準的な同型が存在する。

フロベニウスの相互律は、内積および双線形形式の修正された定義とともに、コンパクト群へと移行する。この定理は現在、類関数ではなく
  
    
      
        G
      
    
    {\displaystyle G}
  
上の二乗可積分関数に対して成立するが、部分群
  
    
      
        H
      
    
    {\displaystyle H}
  
は閉じていなければならない。

### ピーター・ワイルの定理

コンパクト群の表現論におけるもう一つの重要な結果は、ピーター・ワイルの定理である。これは調和解析の中心的かつ基本的な主張の一つであるため、通常そこで提示され証明される。

この定理を再定式化することで、コンパクト群上の関数に対するフーリエ級数の一般化を得ることができる。

## 歴史

有限群Gの複素数体上の表現論の一般的な特徴は、1900年以前にフェルディナント・ゲオルク・フロベニウスによって発見された。その後、リヒャルト・ブラウアーによるモジュラー表現論が発展した。

## 関連項目

- Character theory
- シューアの直交関係
- McKay conjecture
- Burnside ring

## 文献

- Bonnafé, Cedric (2010).Representations of SL2(Fq). Algebra and Applications. Vol. 13. Springer.ISBN.
- Bump, Daniel (2004), Lie Groups, Graduate Texts in Mathematics, vol. 225, New York: Springer-Verlag, ISBN 0-387-21154-3
- [1]   Serre, Jean-Pierre (1977), Linear Representations of Finite Groups, New York: Springer Verlag, ISBN 0-387-90190-6
- [2]   Fulton, William; Harris, Joe: Representation Theory A First Course. Springer-Verlag, New York 1991, ISBN 0-387-97527-6.
- [3]   Alperin, J.L.; Bell, Rowen B.: Groups and Representations Springer-Verlag, New York 1995, ISBN 0-387-94525-3.
- [4]   Deitmar, Anton: Automorphe Formen Springer-Verlag 2010, ISBN 978-3-642-12389-4, p. 89-93,185-189
- [5]   Echterhoff, Siegfried; Deitmar, Anton: Principles of harmonic analysis Springer-Verlag 2009, ISBN 978-0-387-85468-7, p. 127-150
- [6]   Lang, Serge:  Algebra Springer-Verlag, New York 2002, ISBN 0-387-95385-X, p. 663-729
- [7]   Sengupta, Ambar (2012). Representing finite groups: a semisimple introduction. New York. ISBN 9781461412311. OCLC 769756134.{{cite book}}:  CS1 maint: location missing publisher (link)

## 参考文献