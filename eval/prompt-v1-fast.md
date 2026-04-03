表現論は、群が特定の構造に対してどのように作用するかを研究する数学の一分野である。

ここでは特に、ベクトル空間に対する群の作用に焦点を当てる。とはいえ、他の群や集合に対する群の作用も考察の対象となる。詳細については、置換表現の節を参照されたい。

本稿では、いくつかの特筆すべき例外を除き、有限群のみを扱う。また、標数0の体上のベクトル空間に限定して議論を進める。標数0の代数閉体の理論は完全であるため、ある特定の標数0の代数閉体において成立する理論は、他のすべての標数0の代数閉体においても成立する。したがって、一般性を失うことなく、
  
    
      
        
          C
        
        .
      
    
    {\displaystyle \mathbb {C} .}
  
上のベクトル空間を研究することができる。

表現論は数学の多くの分野で用いられるほか、量子化学や物理学においても利用されている。数学においては、とりわけ代数学において群の構造を調べるために用いられる。また、調和解析や数論への応用も存在する。例えば、現代的なアプローチにおいて保型形式に関する新たな知見を得るために表現論が活用されている。

## 定義

### 有限群の表現論 > 定義線形表現

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
  
は一般線形群、
  
    
      
        
          Aut
        
        (
        V
        )
      
    
    {\displaystyle {\text{Aut}}(V)}
  
は自己同型群を表す記法である。すなわち、線形表現とは、すべての
  
    
      
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
  
の表現空間とも呼ばれる。多くの場合、「
  
    
      
        G
      
    
    {\displaystyle G}
  
の表現」という用語は、表現空間
  
    
      
        V
        .
      
    
    {\displaystyle V.}
  
そのものを指すためにも用いられる。

ベクトル空間の代わりに加群における群の表現も、線形表現と呼ばれる。

(
        ρ
        ,
        
          V
          
            ρ
          
        
        )
      
    
    {\displaystyle (\rho ,V_{\rho })}
  
を
  
    
      
        G
        .
      
    
    {\displaystyle G.}
  
の表現
  
    
      
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
  
と書く。空間
  
    
      
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

本稿では、最終章を除き、有限次元の表現空間の研究に限定する。多くの場合、
  
    
      
        V
      
    
    {\displaystyle V}
  
内の有限個のベクトルのみが重要であるため、それらによって生成される部分表現を研究すれば十分である。この部分表現の表現空間は有限次元となる。

表現の次数とは、その表現空間
  
    
      
        V
        .
      
    
    {\displaystyle V.}
  
の次元のことである。表現
  
    
      
        ρ
        .
      
    
    {\displaystyle \rho .}
  
の次数を表すために、表記
  
    
      
        dim
        ⁡
        (
        ρ
        )
      
    
    {\displaystyle \dim(\rho )}
  
が用いられることもある。

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
  
の表現とは、乗法的な群
  
    
      
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
  
の値は1の冪根となる。例えば、
  
    
      
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
  
は群準同型であるため、
  
    
      
        ρ
        (
        
          0
        
        )
        =
        1.
      
    
    {\displaystyle \rho ({0})=1.}
  
を満たさなければならない。
  
    
      
        1
      
    
    {\displaystyle 1}
  
が
  
    
      
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
  
は非自明であるため、
  
    
      
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
  
の像は、4乗根からなる群の非自明な部分群でなければならないという結論に至る。言い換えれば、
  
    
      
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
  
をその上に作用する群とする。
  
    
      
        X
        .
      
    
    {\displaystyle X.}
  
とし、
  
    
      
        
          Aut
        
        (
        X
        )
      
    
    {\displaystyle {\text{Aut}}(X)}
  
をその上のすべての置換からなる群とする。
  
    
      
        X
      
    
    {\displaystyle X}
  
とし、群の演算は合成とする。

有限集合に作用する群は、置換表現の定義として十分であると見なされることがある。しかし、任意の有限集合ではなくベクトル空間に群が作用する線形表現の例を構築したいため、異なるアプローチをとる必要がある。置換表現を構築するには、
  
    
      
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
  
を持つベクトル空間
  
    
      
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

#### 左正則表現および右正則表現

G
      
    
    {\displaystyle G}
  
を群、
  
    
      
        (
        
          e
          
            t
          
        
        
          )
          
            t
            ∈
            G
          
        
      
    
    {\displaystyle (e_{t})_{t\in G}}
  
を
  
    
      
        G
        .
      
    
    {\displaystyle G.}
  
の元で添字付けられた基底を持つ次元
  
    
      
        
          |
        
        G
        
          |
        
      
    
    {\displaystyle |G|}
  
のベクトル空間
  
    
      
        V
      
    
    {\displaystyle V}
  
とする。左正則表現は、
  
    
      
        X
        =
        G
        .
      
    
    {\displaystyle X=G.}
  
を選択することによる置換表現の特殊なケースである。これは、すべての
  
    
      
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
  
の像の族
  
    
      
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
  
の基底となる。左正則表現の次数は、群の位数と等しい。

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
  
を介して同型である。このため、これらを区別せず、単に「正則表現」と呼ぶことも多い。

詳細に検討すると、以下の結果が得られる。与えられた線形表現
  
    
      
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
  
および基底
  
    
      
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
  
を持つ
  
    
      
        V
        =
        
          
            R
          
          
            5
          
        
      
    
    {\displaystyle V=\mathbb {R} ^{5}}
  
とする。このとき、左正則表現
  
    
      
        
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
  
は
  
    
      
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
  
で定義される。右正則表現は、
  
    
      
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
  
となるように同様に定義される。

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
  
の群環とする。この代数は自由であり、基底は
  
    
      
        G
        .
      
    
    {\displaystyle G.}
  
の元によって添字付け可能である。多くの場合、基底は
  
    
      
        G
      
    
    {\displaystyle G}
  
と同一視される。すべての元
  
    
      
        f
        ∈
        K
        [
        G
        ]
      
    
    {\displaystyle f\in K[G]}
  
は、次のように一意に表現できる。

K
        [
        G
        ]
      
    
    {\displaystyle K[G]}
  
における乗法は、
  
    
      
        G
      
    
    {\displaystyle G}
  
における乗法を分配的に拡張したものである。

次に、
  
    
      
        V
      
    
    {\displaystyle V}
  
を
  
    
      
        K
      
    
    {\displaystyle K}
  
–加群、
  
    
      
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
  
の線形表現を得ることもできる。さらに、表現の準同型は群環の準同型と全単射に対応する。したがって、これらの用語は互換的に使用される場合がある。[1][2] これは圏同型の一例である。

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
  
加群は次のように与えられる。
  
    
      
        
          C
        
        [
        G
        ]
      
    
    {\displaystyle \mathbb {C} [G]}
  
自身は左正則表現に対応する。同様に、
  
    
      
        
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
  
加群とみなすと、右正則表現に対応する。

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
  
を
  
    
      
        
          C
        
      
    
    {\displaystyle \mathbb {C} }
  
上のベクトル空間とする。加法とスカラー倍という演算を導入すれば、このベクトル空間は
  
    
      
        
          
            C
          
          
            
              |
            
            G
            
              |
            
          
        
        .
      
    
    {\displaystyle \mathbb {C} ^{|G|}.}
  
と同型になる。2つの元
  
    
      
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
  
の畳み込みを次のように定義する。

これにより、
  
    
      
        
          L
          
            1
          
        
        (
        G
        )
      
    
    {\displaystyle L^{1}(G)}
  
は代数となる。この代数
  
    
      
        
          L
          
            1
          
        
        (
        G
        )
      
    
    {\displaystyle L^{1}(G)}
  
を畳み込み代数と呼ぶ。

畳み込み代数は自由代数であり、群の元によって添字付けられた基底を持つ。すなわち、
  
    
      
        (
        
          δ
          
            s
          
        
        
          )
          
            s
            ∈
            G
          
        
        ,
      
    
    {\displaystyle (\delta _{s})_{s\in G},}
  
において

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
  
と線形に拡張することで定義する。明らかに、この写像は全単射である。上の式で示した2つの基底元の畳み込みを詳細に検討すると、
  
    
      
        
          L
          
            1
          
        
        (
        G
        )
      
    
    {\displaystyle L^{1}(G)}
  
における乗法は、
  
    
      
        
          C
        
        [
        G
        ]
        .
      
    
    {\displaystyle \mathbb {C} [G].}
  
における乗法に対応することがわかる。したがって、畳み込み代数と群代数は代数として同型である。

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
  
–代数にする。
  
    
      
        
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
  
に拡張される。代数準同型の特性として乗法性が挙げられるため、
  
    
      
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
  
がユニタリである場合、
  
    
      
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
  
も得られる。ユニタリ表現の定義については、性質の章を参照されたい。その章では、（一般性を失うことなく）すべての線形表現はユニタリであると仮定できることを示す。

畳み込み代数を用いることで、群
  
    
      
        G
        .
      
    
    {\displaystyle G.}
  
上のフーリエ変換を実装できる。調和解析の分野では、以下の定義が
  
    
      
        
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
  
を次のように定義する。

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
  
に対する2つの表現
  
    
      
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
  
が成り立つような線形写像
  
    
      
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
  
の核、像、および余核は標準的に定義される。同変写像の合成は再び同変写像となる。同変写像を射とする表現の圏が存在する。これらは再び
  
    
      
        G
      
    
    {\displaystyle G}
  
加群である。したがって、前節で述べた対応関係により、これらは
  
    
      
        G
      
    
    {\displaystyle G}
  
の表現を与える。

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
  
が成り立つものとする。このとき、制限
  
    
      
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
  
の表現となる。これを
  
    
      
        V
        .
      
    
    {\displaystyle V.}
  
の部分表現と呼ぶ。任意の表現 V は少なくとも2つの部分表現を持つ。すなわち、0のみからなるものと、V 自身である。この2つ以外に部分表現を持たない場合、その表現を既約表現と呼ぶ。と呼ぶ。これらの表現は群代数
  
    
      
        
          C
        
        [
        G
        ]
      
    
    {\displaystyle \mathbb {C} [G]}
  
上の単純加群そのものであるため、単純表現と呼ぶ著者もいる。

シューアの補題は、既約表現間の写像に強い制約を課す。
  
    
      
        
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
  
がともに既約であり、
  
    
      
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
  
であるならば、以下の二分法が成り立つ。

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
  
が同型であれば、G線形写像の空間は1次元である。
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
  
は、表現空間の間に
  
    
      
        G
      
    
    {\displaystyle G}
  
線形ベクトル空間同型が存在する場合、同値または同型と呼ばれる。言い換えれば、全単射な線形写像
  
    
      
        T
        :
        
          V
          
            ρ
          
        
        →
        
          V
          
            π
          
        
        ,
      
    
    {\displaystyle T:V_{\rho }\to V_{\pi },}
  
が存在して、すべての
  
    
      
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
  
を満たすとき、それらは同型である。特に、同値な表現は同じ次数を持つ。

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

定義域だけでなく値域を制限することもできる。

H
      
    
    {\displaystyle H}
  
を
  
    
      
        G
        .
      
    
    {\displaystyle G.}
  
の部分群とする。
  
    
      
        ρ
      
    
    {\displaystyle \rho }
  
を
  
    
      
        G
        .
      
    
    {\displaystyle G.}
  
の線形表現とする。

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
  
を用いることがある。

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
  
という記法は、
  
    
      
        V
      
    
    {\displaystyle V}
  
の
  
    
      
        G
      
    
    {\displaystyle G}
  
の表現を
  
    
      
        H
        .
      
    
    {\displaystyle H.}
  
に制限したものを示すためにも用いられる。

f
      
    
    {\displaystyle f}
  
を
  
    
      
        G
        .
      
    
    {\displaystyle G.}
  
上の関数とする。部分群
  
    
      
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

表現が既約表現の直和として書けるとき、その表現は半単純または完全可約であると呼ばれる。これは、半単純代数に対する対応する定義と類似している。

表現の直和の定義については、表現の直和に関する節を参照されたい。

表現が互いに同型な既約表現の直和である場合、その表現は等型（isotypic）と呼ばれる。

G
        .
      
    
    {\displaystyle G.}
  
の与えられた表現を
  
    
      
        (
        ρ
        ,
        
          V
          
            ρ
          
        
        )
      
    
    {\displaystyle (\rho ,V_{\rho })}
  
とする。
  
    
      
        G
        .
      
    
    {\displaystyle G.}
  
の既約表現を
  
    
      
        τ
      
    
    {\displaystyle \tau }
  
とする。
  
    
      
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
  
上のすべてのベクトル空間には内積を与えることができる。内積を備えたベクトル空間における群
  
    
      
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
  
が ユニタリであるとき、ユニタリ表現と呼ばれる。これは特に、すべての
  
    
      
        ρ
        (
        s
        )
      
    
    {\displaystyle \rho (s)}
  
が 対角化可能であることを意味する。詳細についてはユニタリ表現の記事を参照のこと。

表現が与えられた内積に関してユニタリであるとは、その内積が
  
    
      
        G
        ,
      
    
    {\displaystyle G,}
  
の誘導された作用に関して不変であること、すなわちすべての
  
    
      
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

したがって、一般性を失うことなく、今後考慮するすべての表現はユニタリであると仮定できる。

例。
  
    
      
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
  
を、
  
    
      
        μ
        ,
        ν
      
    
    {\displaystyle \mu ,\nu }
  
によって生成され、性質
  
    
      
        
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
  
を満たす、位数
  
    
      
        6
      
    
    {\displaystyle 6}
  
の二面体群とする。
  
    
      
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
  
を、生成元上で次のように定義される
  
    
      
        
          D
          
            6
          
        
      
    
    {\displaystyle D_{6}}
  
の線形表現とする。

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
  
が存在する。ゆえに、この表現は既約ではない。言及した部分表現は次数1であり、既約である。
  
    
      
        
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

両方の部分表現は等型であり、
  
    
      
        ρ
        .
      
    
    {\displaystyle \rho .}
  
の唯一の非零な等型成分である。

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
  
に対して
  
    
      
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
  
という方程式で定義される
  
    
      
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
  
、表現が得られる。
  
    
      
        
          
            Res
          
          
            H
          
        
        (
        ρ
        )
        .
      
    
    {\displaystyle {\text{Res}}_{H}(\rho ).}
  
この表現は像によって定義される。
  
    
      
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
  
を同じ群
  
    
      
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
  
はそれぞれ虚数単位および1の原始立方根である）：

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
  
の外テンソル積と呼ばれる。その存在と一意性はテンソル積の性質の帰結である。

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

同一の群の2つの線形表現を
  
    
      
        
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
  
および
  
    
      
        s
      
    
    {\displaystyle s}
  
とする。
  
    
      
        G
        .
      
    
    {\displaystyle G.}
  
の元を
  
    
      
        s
      
    
    {\displaystyle s}
  
とする。このとき
  
    
      
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
  
の線形表現を定義し、これも与えられた表現のテンソル積と呼ばれる。

これら二つのケースは厳密に区別されなければならない。第一のケースは、群積から対応する表現空間のテンソル積への表現である。第二のケースは、群
  
    
      
        G
      
    
    {\displaystyle G}
  
からこの一つの群の二つの表現空間のテンソル積への表現である。しかし、この最後のケースは、対角部分群に注目することで第一のケースの特殊な場合とみなすことができる。
  
    
      
        G
        ×
        G
        .
      
    
    {\displaystyle G\times G.}
  
この定義は有限回繰り返すことができる。

V
      
    
    {\displaystyle V}
  
および
  
    
      
        W
      
    
    {\displaystyle W}
  
を群
  
    
      
        G
        .
      
    
    {\displaystyle G.}
  
の表現とする。このとき、以下の恒等式
  
    
      
        
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
  
により、
  
    
      
        
          Hom
        
        (
        V
        ,
        W
        )
      
    
    {\displaystyle {\text{Hom}}(V,W)}
  
は表現となる。
  
    
      
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
  
とする。すると、上記の恒等式から以下の結果が導かれる。

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
  
    
      
        V
        .
      
    
    {\displaystyle V.}
  
の基底を
  
    
      
        (
        
          e
          
            k
          
        
        )
      
    
    {\displaystyle (e_{k})}
  
とする。
  
    
      
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
  
を線形に拡張することで
  
    
      
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
  
不変であり、これによって対称積および交代積と呼ばれる部分表現がそれぞれ定義される。これらの部分表現は、
  
    
      
        
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
  
および対称積
  
    
      
        
          
            Sym
          
          
            m
          
        
        (
        V
        )
        .
      
    
    {\displaystyle {\text{Sym}}^{m}(V).}
  
と表記される。もし
  
    
      
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
  
が、一般にはこれら二つの積の直和とは等しくない場合。

## 分解

表現をより容易に理解するために、表現空間をより単純な部分表現の直和に分解することが望ましい。有限群については、以下の結果で見るように、これが達成可能である。より詳細な説明と証明は、 [1]および [2]に見ることができる。

部分表現とその補空間は、表現を一意に決定する。

以下の定理は、コンパクト群（したがって有限群も含む）の表現に関する非常に美しい結果を与えるため、より一般的な形で提示される。

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
  
が半単純である、すなわち単純環の直和であるならば。

この分解は一意ではないことに注意せよ。しかし、与えられた既約表現と同型な部分表現がこの分解に何回現れるかという数は、分解の選択によらず一定である。

一意な分解を得るためには、互いに同型なすべての既約部分表現を組み合わせる必要がある。つまり、表現空間をそのアイソタイプ（同型類）の直和に分解する。この分解は一意に決定され、標準分解と呼ばれる。

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
  
（同型を除いて）。を
  
    
      
        V
      
    
    {\displaystyle V}
  
を群の表現とし
  
    
      
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
  
は次のように与えられる。

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

すると
  
    
      
        P
      
    
    {\displaystyle P}
  
は
  
    
      
        G
      
    
    {\displaystyle G}
  
線形写像である。なぜなら

この命題により、与えられた表現の自明な部分表現へのアイソタイプを明示的に決定することができる。

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
  
に対応する固有空間がその射影の像であるという事実から導かれる。射影のトレースはすべての固有値の和であるため、次の結果が得られる。

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
  
を非自明な既約表現とする。
  
    
      
        G
        .
      
    
    {\displaystyle G.}
  
このとき、自明な表現へのアイソタイプは
  
    
      
        π
      
    
    {\displaystyle \pi }
  
は零空間である。つまり、次の等式が成り立つ。

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
  
を正規直交基底とする。
  
    
      
        
          V
          
            π
          
        
        .
      
    
    {\displaystyle V_{\pi }.}
  
このとき、次が成り立つ。

したがって、非自明な既約表現
  
    
      
        V
      
    
    {\displaystyle V}
  
に対して次が有効である。

例。
  
    
      
        G
        =
        
          Per
        
        (
        3
        )
      
    
    {\displaystyle G={\text{Per}}(3)}
  
を3元置換群とする。
  
    
      
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
  
を次のような線形表現とする。
  
    
      
        
          Per
        
        (
        3
        )
      
    
    {\displaystyle {\text{Per}}(3)}
  
生成元に対して次のように定義される。

この表現は、一見すると
  
    
      
        
          Per
        
        (
        3
        )
        ,
      
    
    {\displaystyle {\text{Per}}(3),}
  
の左正則表現（以下、
  
    
      
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
  
である。この部分空間に制限すると、これも
  
    
      
        G
      
    
    {\displaystyle G}
  
不変であることは前述の通りであり、表現
  
    
      
        τ
      
    
    {\displaystyle \tau }
  
が得られる。これは次のように与えられる。

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
  
のアイソタイプであり、
  
    
      
        ρ
      
    
    {\displaystyle \rho }
  
である。したがって、標準分解は次のように与えられる。

上記の定理は、一般に無限群に対しては成立しない。これを示す例として、次を考える。

行列の積
  
    
      
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
  
上で対角化可能であることを意味する。これは誤りであることが知られており、したがって矛盾が生じる。

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
  
を次のように定義される表現とする。

指標
  
    
      
        
          χ
          
            ρ
          
        
      
    
    {\displaystyle \chi _{\rho }}
  
は次のように与えられる。

置換表現の指標は、特に計算が容易である。Vが有限集合
  
    
      
        X
      
    
    {\displaystyle X}
  
への
  
    
      
        G
      
    
    {\displaystyle G}
  
の左作用に対応するG-表現であるならば、

例えば[5]、正則表現
  
    
      
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

この公式は、2つの正方行列の積 AB のトレースが BA のトレースと等しいという事実から導かれる。このような公式を満たす関数
  
    
      
        G
        →
        
          C
        
      
    
    {\displaystyle G\to \mathbb {C} }
  
は類関数と呼ばれる。言い換えれば、類関数、特に指標は各共役類
  
    
      
        
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
  
は次の和であることがわかる。
  
    
      
        ρ
        (
        s
        )
      
    
    {\displaystyle \rho (s)}
  
の固有値の重複度を込めた和である。表現の次数が n である場合、その和は n 個の項からなる。s の位数が m である場合、これらの固有値はすべて m 乗の1の冪根である。この事実は
  
    
      
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
  
を示すために使用でき、また
  
    
      
        
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
  
を意味する。

単位行列のトレースは行数に等しいため、
  
    
      
        χ
        (
        e
        )
        =
        n
        ,
      
    
    {\displaystyle \chi (e)=n,}
  
となる。ここで
  
    
      
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
  
という2つの与えられた表現から
  
    
      
        
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
  
関連する表現の指標を導くかを示している。

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

指標に関する特に興味深い結果をいくつか示すために、群上のより一般的な型の関数を考察することは有益である。

定義（類関数）。関数
  
    
      
        φ
        :
        G
        →
        
          C
        
      
    
    {\displaystyle \varphi :G\to \mathbb {C} }
  
が
  
    
      
        G
      
    
    {\displaystyle G}
  
の共役類上で定数であるとき、類関数と呼ぶ。すなわち、

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

有限群上のすべての類関数の集合上には、内積を定義することができる。

正規直交性。もし
  
    
      
        
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
  
の相異なる既約指標であるならば、それらは上述の内積に関してすべての類関数のベクトル空間の正規直交基底をなす。すなわち、

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
  
をすべての指標と直交する類関数と仮定する。すると上記より、
  
    
      
        ρ
      
    
    {\displaystyle \rho }
  
が既約であるときは常に
  
    
      
        
          ρ
          
            f
          
        
        =
        0
      
    
    {\displaystyle \rho _{f}=0}
  
となる。しかし、分解可能性により、すべての
  
    
      
        ρ
      
    
    {\displaystyle \rho }
  
に対して
  
    
      
        
          ρ
          
            f
          
        
        =
        0
      
    
    {\displaystyle \rho _{f}=0}
  
が成り立つことになる。
  
    
      
        ρ
      
    
    {\displaystyle \rho }
  
を正則表現とする。特定の基底元
  
    
      
        g
      
    
    {\displaystyle g}
  
に
  
    
      
        
          ρ
          
            f
          
        
      
    
    {\displaystyle \rho _{f}}
  
を適用すると、
  
    
      
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
  
となる。

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
  
の指標であるための必要十分条件は、それが相異なる既約指標
  
    
      
        
          χ
          
            j
          
        
      
    
    {\displaystyle \chi _{j}}
  
の非負整数係数の線形結合として書けることである。すなわち、
  
    
      
        G
      
    
    {\displaystyle G}
  
上の類関数
  
    
      
        φ
      
    
    {\displaystyle \varphi }
  
が
  
    
      
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
  
は非負整数）を満たすならば、
  
    
      
        φ
      
    
    {\displaystyle \varphi }
  
は表現
  
    
      
        
          τ
          
            j
          
        
      
    
    {\displaystyle \tau _{j}}
  
（
  
    
      
        
          χ
          
            j
          
        
        .
      
    
    {\displaystyle \chi _{j}.}
  
に対応）の直和
  
    
      
        
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
  
の指標である。逆に、任意の指標は常に既約指標の和として書くことができる。

上述の内積は、すべての
  
    
      
        
          C
        
      
    
    {\displaystyle \mathbb {C} }
  
値関数の集合上に拡張できる。
  
    
      
        
          L
          
            1
          
        
        (
        G
        )
      
    
    {\displaystyle L^{1}(G)}
  
（有限群上の関数）：

L
          
            1
          
        
        (
        G
        )
        :
      
    
    {\displaystyle L^{1}(G):}
  
上には対称双線形形式も定義できる。

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
  
の表現であることに注意されたい。正規直交性により
  
    
      
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
  
加群が存在する。

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

以下では、これらの双線形形式を用いることで、表現の分解および既約性に関するいくつかの重要な結果を得ることができる。

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
  
の指標とする。そのとき
  
    
      
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

上記の結果、シューアの補題、および表現の完全可約性から、以下の定理を導くことが可能である。

これを用いて、表現を解析するための非常に有用な結果が得られる。

既約性判定法。
  
    
      
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
  
が成り立つのは、かつそのときに限り、
  
    
      
        V
      
    
    {\displaystyle V}
  
は既約である。

したがって、第一定理を用いると、
  
    
      
        G
      
    
    {\displaystyle G}
  
の既約表現の指標は、この内積に関して
  
    
      
        
          
            C
          
          
            class
          
        
        (
        G
        )
      
    
    {\displaystyle \mathbb {C} _{\text{class}}(G)}
  
上で正規直交系をなす。

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

数値的な結果として次が得られる。

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

この公式は、群の既約表現を同型を除いて分類するという問題に対する「必要十分」条件である。これは、ある群の既約表現の同型類をすべて見つけたかどうかを確認する手段を我々に提供する。

同様に、
  
    
      
        s
        ≠
        e
        ,
      
    
    {\displaystyle s\neq e,}
  
で評価された正則表現の指標を用いることで、次の等式が得られる。

畳み込み代数を通じた表現の記述を用いることで、これらの等式の等価な定式化が得られる。

さらに、プランシュレル公式が成り立つ。

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

線形表現の性質の節で示したように、群の表現から出発して、制限によって部分群の表現を得ることができる。当然ながら、我々は逆の過程に関心がある。すなわち、部分群の表現から出発して群の表現を得ることは可能であろうか。以下に定義する誘導表現が、必要な概念を提供してくれることがわかるであろう。確かに、この構成は制限の逆ではなく、随伴である。

### 定義

G
        .
      
    
    {\displaystyle G.}
  
の線形表現を
  
    
      
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
  
とする。
  
    
      
        H
      
    
    {\displaystyle H}
  
を部分群、
  
    
      
        ρ
        
          
            |
          
          
            H
          
        
      
    
    {\displaystyle \rho |_{H}}
  
をその制限とする。
  
    
      
        
          ρ
          
            H
          
        
        .
      
    
    {\displaystyle \rho _{H}.}
  
の部分表現を
  
    
      
        W
      
    
    {\displaystyle W}
  
とする。この表現を
  
    
      
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
  
の左剰余類
  
    
      
        s
        H
      
    
    {\displaystyle sH}
  
のみに依存する。
  
    
      
        G
        
          /
        
        H
        ,
      
    
    {\displaystyle G/H,}
  
の代表系を
  
    
      
        R
      
    
    {\displaystyle R}
  
とすると、次が成り立つ。

は
  
    
      
        
          V
          
            ρ
          
        
        .
      
    
    {\displaystyle V_{\rho }.}
  
の部分表現である。

V
          
            ρ
          
        
      
    
    {\displaystyle V_{\rho }}
  
における
  
    
      
        G
      
    
    {\displaystyle G}
  
の表現
  
    
      
        ρ
      
    
    {\displaystyle \rho }
  
が、
  
    
      
        W
        ,
      
    
    {\displaystyle W,}
  
における
  
    
      
        H
      
    
    {\displaystyle H}
  
の表現
  
    
      
        θ
      
    
    {\displaystyle \theta }
  
によって誘導されるとは、

ここで、すべての
  
    
      
        
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
  
について
  
    
      
        s
        ∈
        r
        H
      
    
    {\displaystyle s\in rH}
  
、およびすべての
  
    
      
        r
        ∈
        R
        .
      
    
    {\displaystyle r\in R.}
  
について。言い換えれば、表現
  
    
      
        (
        ρ
        ,
        
          V
          
            ρ
          
        
        )
      
    
    {\displaystyle (\rho ,V_{\rho })}
  
が
  
    
      
        (
        θ
        ,
        W
        )
        ,
      
    
    {\displaystyle (\theta ,W),}
  
によって誘導されるとは、すべての
  
    
      
        v
        ∈
        
          V
          
            ρ
          
        
      
    
    {\displaystyle v\in V_{\rho }}
  
が次のように一意に書けることである。

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

表現
  
    
      
        θ
      
    
    {\displaystyle \theta }
  
of
  
    
      
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
  
、あるいは混同の恐れがない場合は短く
  
    
      
        ρ
        =
        
          Ind
        
        (
        θ
        )
        ,
      
    
    {\displaystyle \rho ={\text{Ind}}(\theta ),}
  
と表記する。表現写像の代わりに表現空間自体が頻繁に使用される。すなわち、表現
  
    
      
        V
      
    
    {\displaystyle V}
  
が
  
    
      
        W
        .
      
    
    {\displaystyle W.}
  
によって誘導される場合、
  
    
      
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
  
または
  
    
      
        V
        =
        
          Ind
        
        (
        W
        )
        ,
      
    
    {\displaystyle V={\text{Ind}}(W),}
  
と表記する。

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
  
    
      
        G
      
    
    {\displaystyle G}
  
が第一成分に作用する
  
    
      
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
  
において、すべての
  
    
      
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
  
が成り立つとき、
  
    
      
        V
      
    
    {\displaystyle V}
  
は
  
    
      
        W
      
    
    {\displaystyle W}
  
によって誘導されるという。

### 性質

本節で導入される結果は証明なしで提示される。これらは [1]および [2]に見ることができる。

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
  
加群と解釈すれば、
  
    
      
        
          
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
  
準同型のベクトル空間である。同じことが
  
    
      
        
          
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
  
についても言える。

類関数の誘導。表現の場合と同様に、誘導を用いることで、部分群上の類関数から群上の類関数を得ることができる。
  
    
      
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
  
によって誘導されると言い、
  
    
      
        
          
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

H
      
    
    {\displaystyle H}
  
の既約表現を
  
    
      
        W
      
    
    {\displaystyle W}
  
とし、
  
    
      
        G
        ,
      
    
    {\displaystyle G,}
  
の既約表現を
  
    
      
        V
      
    
    {\displaystyle V}
  
とすると、フロベニウスの相互律により、
  
    
      
        W
      
    
    {\displaystyle W}
  
は
  
    
      
        
          Res
        
        (
        V
        )
      
    
    {\displaystyle {\text{Res}}(V)}
  
に
  
    
      
        
          Ind
        
        (
        W
        )
      
    
    {\displaystyle {\text{Ind}}(W)}
  
が
  
    
      
        V
        .
      
    
    {\displaystyle V.}
  
に含まれる回数だけ含まれる。

この主張は内積についても有効である。

### マッキーの既約性判定法

ジョージ・マッキーは、誘導表現の既約性を検証するための基準を確立した。これには、まずいくつかの定義と記法に関する仕様が必要となる。

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
  
が共通の既約成分を持たない場合、すなわち
  
    
      
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
  
である場合、それらは互いに素であると呼ばれる。

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
  
を定義する。部分群
  
    
      
        H
        .
      
    
    {\displaystyle H.}
  
の表現を
  
    
      
        (
        ρ
        ,
        W
        )
      
    
    {\displaystyle (\rho ,W)}
  
とする。これは制限によって
  
    
      
        
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
  
が存在し、
  
    
      
        H
      
    
    {\displaystyle H}
  
の既約表現
  
    
      
        η
      
    
    {\displaystyle \eta }
  
が
  
    
      
        ρ
      
    
    {\displaystyle \rho }
  
を誘導するか、
- あるいは
  
    
      
        V
      
    
    {\displaystyle V}
  
がアイソタイプ的な
  
    
      
        
          C
        
        A
      
    
    {\displaystyle \mathbb {C} A}
  
加群である。
A
      
    
    {\displaystyle A}
  
がアーベル群である場合、
  
    
      
        A
      
    
    {\displaystyle A}
  
のアイソタイプ的加群は既約であり、次数1であり、すべて相似変換であることに注意せよ。

A
      
    
    {\displaystyle A}
  
が
  
    
      
        G
      
    
    {\displaystyle G}
  
の（必ずしも正規ではない）アーベル部分群である場合、一般に
  
    
      
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
  
は満たされないが、それにもかかわらず
  
    
      
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
  
は依然として有効である。

#### 半直積の表現の分類

以下では、
  
    
      
        G
        =
        A
        ⋊
        H
      
    
    {\displaystyle G=A\rtimes H}
  
を半直積とし、その正規半直積因子である
  
    
      
        A
      
    
    {\displaystyle A}
  
はアーベル群であるとする。このような群の既約表現は、
  
    
      
        G
        ,
      
    
    {\displaystyle G,}
  
のすべての既約表現が、
  
    
      
        G
      
    
    {\displaystyle G}
  
の特定の各部分群から構成できることを示すことで分類可能である。
  
    
      
        H
      
    
    {\displaystyle H}
  
。これはウィグナーおよびマッキーによるいわゆる「小さな群」の方法である。

A
      
    
    {\displaystyle A}
  
は可換であるため、
  
    
      
        A
      
    
    {\displaystyle A}
  
の既約指標は次数1を持ち、群
  
    
      
        
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
  
における軌道の代表系をとする。各
  
    
      
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
  
の対応する部分群を
  
    
      
        
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
  
上の類関数である。さらに、すべての
  
    
      
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
  
の一次表現が得られ、それは自身の指標と一致する。

ここで
  
    
      
        ρ
      
    
    {\displaystyle \rho }
  
を
  
    
      
        
          H
          
            j
          
        
        .
      
    
    {\displaystyle H_{j}.}
  
の既約表現とする。すると、
  
    
      
        ρ
      
    
    {\displaystyle \rho }
  
を 標準射影
  
    
      
        
          G
          
            j
          
        
        →
        
          H
          
            j
          
        
        .
      
    
    {\displaystyle G_{j}\to H_{j}.}
  
と合成することで、
  
    
      
        
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
  
の テンソル積 を構成する。こうして、
  
    
      
        
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
  
、さらに
  
    
      
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
命題の証明には、マッキーの判定法やフロベニウスの相互律に基づく結論などが用いられる。詳細は [1] を参照されたい。

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
  
の表現環は、アーベル群として定義される。

テンソル積によって与えられる乗法により、
  
    
      
        R
        (
        G
        )
      
    
    {\displaystyle R(G)}
  
は環となる。その元である
  
    
      
        R
        (
        G
        )
      
    
    {\displaystyle R(G)}
  
は仮想表現と呼ばれる。

指標は、複素数値をとる
  
    
      
        G
      
    
    {\displaystyle G}
  
上のすべての類関数の集合における環準同型を定義する。

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
  
は単射である。その像である
  
    
      
        χ
      
    
    {\displaystyle \chi }
  
は仮想指標と呼ばれる。

既約指標は
  
    
      
        
          
            C
          
          
            class
          
        
        ,
        χ
      
    
    {\displaystyle \mathbb {C} _{\text{class}},\chi }
  
の正規直交基底をなすため、同型写像が誘導される。

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
  
により、
  
    
      
        
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
  
はそれぞれ
  
    
      
        
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
  
によって生成される群、すなわち2つの指標のすべての差の集合を
  
    
      
        
          
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
  
が得られ、仮想指標は仮想表現と最適に対応する。

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
  
はすべての仮想指標の集合となる。2つの指標の積は別の指標を与えるため、
  
    
      
        
          
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
  
の部分環である。
  
    
      
        
          χ
          
            i
          
        
      
    
    {\displaystyle \chi _{i}}
  
は
  
    
      
        
          
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

H
      
    
    {\displaystyle H}
  
を
  
    
      
        G
        .
      
    
    {\displaystyle G.}
  
の部分群とする。この制限は環準同型
  
    
      
        
          
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

フロベニウス相互律によれば、これら2つの準同型は双線形形式
  
    
      
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
  
に関して随伴である。さらに、公式
  
    
      
        
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
  
に対して同様に定義でき、誘導により
  
    
      
        R
        (
        G
        )
        .
      
    
    {\displaystyle R(G).}
  
に対する写像
  
    
      
        
          Ind
        
      
    
    {\displaystyle {\text{Ind}}}
  
が得られる。フロベニウス相互律により、これらの写像は互いに随伴であり、像
  
    
      
        
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
  
は
  
    
      
        H
      
    
    {\displaystyle H}
  
の同型を除いたすべての既約表現である。

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

G1
  
    
      
        
          G
          
            1
          
        
      
    
    {\displaystyle G_{1}}
  
および
  
    
      
        
          G
          
            2
          
        
      
    
    {\displaystyle G_{2}}
  
を、それぞれ表現
  
    
      
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
        .
      
    
    {\displaystyle (\rho _{2},V_{2}).}
  
を持つ2つの群とする。このとき、
  
    
      
        
          ρ
          
            1
          
        
        ⊗
        
          ρ
          
            2
          
        
      
    
    {\displaystyle \rho _{1}\otimes \rho _{2}}
  
は、直積
  
    
      
        
          G
          
            1
          
        
        ×
        
          G
          
            2
          
        
      
    
    {\displaystyle G_{1}\times G_{2}}
  
の表現である。これは前節で示した通りである。同節のもう一つの結果として、
  
    
      
        
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
  
および
  
    
      
        
          η
          
            2
          
        
      
    
    {\displaystyle \eta _{2}}
  
は、それぞれ
  
    
      
        
          G
          
            1
          
        
      
    
    {\displaystyle G_{1}}
  
および
  
    
      
        
          G
          
            2
          
        
        ,
      
    
    {\displaystyle G_{2},}
  
の既約表現である。これは表現環において、以下の等式として引き継がれる。
  
    
      
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
  
は、
  
    
      
        
          Z
        
      
    
    {\displaystyle \mathbb {Z} }
  
加群としての表現環のテンソル積である。

## 誘導定理

誘導定理は、与えられた有限群Gの表現環と、Gの部分群Hからなる族Xの表現環を関連付けるものである。より正確には、そのような部分群の集合に対して、誘導関手は写像を生成する。

アルティンの誘導定理は、この一連の結果の中で最も初等的な定理である。この定理は、以下の条件が同値であることを主張する。

- φ
      
    
    {\displaystyle \varphi }
  
の余核は有限である。
- G
      
    
    {\displaystyle G}
  
は
  
    
      
        X
        ,
      
    
    {\displaystyle X,}
  
に属する部分群の共役の和集合である。すなわち、
  
    
      
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
  
である。
R
          
        
        (
        G
        )
      
    
    {\displaystyle {\mathcal {R}}(G)}
  
は群として有限生成であるため、最初の点は次のように言い換えられる。

- G
        ,
      
    
    {\displaystyle G,}
  
の各指標
  
    
      
        χ
      
    
    {\displaystyle \chi }
  
に対して、
  
    
      
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
  
を満たす仮想指標
  
    
      
        
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
  
が存在する。
Serre (1977)は、この定理の2つの証明を与えている。例えば、Gは巡回部分群の和集合であるため、
  
    
      
        G
      
    
    {\displaystyle G}
  
のすべての指標は、巡回部分群の指標から誘導された指標の有理数係数線形結合である。
  
    
      
        G
        .
      
    
    {\displaystyle G.}
  
の巡回群の表現はよく理解されており、特に既約表現は1次元であるため、これはGの表現に対するある種の制御を与える。

上記の状況下では、
  
    
      
        φ
      
    
    {\displaystyle \varphi }
  
が全射であるとは一般には言えない。ブラウアーの誘導定理 は、X がすべての 素部分群 の族であるならば、
  
    
      
        φ
      
    
    {\displaystyle \varphi }
  
は全射であると主張する。ここで、ある素数 p が存在して、H が
  
    
      
        p
      
    
    {\displaystyle p}
  
と互いに素な位数の 巡回群 と 直積 をなすとき、群 H は 素 であるという。
  
    
      
        p
      
    
    {\displaystyle p}
  
群。言い換えれば、
  
    
      
        G
      
    
    {\displaystyle G}
  
のすべての 指標 は、素部分群の指標から誘導された指標の整数係数線形結合である。ブラウアーの定理に現れる素部分群 H は巡回群よりも豊かな表現論を持ち、少なくとも、そのような H の任意の既約表現は（必然的に同じく素である）部分群
  
    
      
        K
        ⊂
        H
      
    
    {\displaystyle K\subset H}
  
の1次元表現から誘導されるという性質を持つ。（この後者の性質は、任意の超可解群（これには冪零群が含まれ、特に初等群が含まれる）。このように1次表現から表現を誘導できるという性質は、有限群の表現論においてさらなる帰結をもたらす。

## 実表現

C
        
      
    
    {\displaystyle \mathbb {C} }
  
の一般的な部分体上の表現に関する証明および詳細については、[2]を参照されたい。

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
  
上の対応する表現は実であると呼ばれる（
  
    
      
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
  
によって与えられる。

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
  
値をとる。したがって、実表現の指標は常に実数値をとると結論付けることができる。しかし、実数値指標を持つすべての表現が実表現であるとは限らない。これを明確にするために、
  
    
      
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
  
内の任意の行列のトレースは実数であるため、その表現の指標は実数値をとる。
  
    
      
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
  
は非アーベル群として選ばれていた。今や、
  
    
      
        
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
  
は 四元数 の単元と同一視できることに注目せよ。ここで
  
    
      
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
  
の以下の2次元表現は実数値ではないが、実数値の指標を持つ。

そのとき、
  
    
      
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
  
上で実であるすべての既約表現を分類したとしても、すべての既約実表現を分類したことにはならない。しかし、以下の結果が得られる。

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

定義。四元数的表現とは、(複素)表現
  
    
      
        V
        ,
      
    
    {\displaystyle V,}
  
であって、
  
    
      
        G
      
    
    {\displaystyle G}
  
不変な反線形準同型
  
    
      
        J
        :
        V
        →
        V
      
    
    {\displaystyle J:V\to V}
  
で、
  
    
      
        
          J
          
            2
          
        
        =
        −
        
          Id
        
        .
      
    
    {\displaystyle J^{2}=-{\text{Id}}.}
  
を満たすものをもつものをいう。したがって、歪対称かつ非退化な
  
    
      
        G
      
    
    {\displaystyle G}
  
不変な双線形形式は、上に四元数的構造を定める。

## 特定の群の表現

### 対称群

対称群
  
    
      
        
          S
          
            n
          
        
      
    
    {\displaystyle S_{n}}
  
の表現は集中的に研究されてきた。
  
    
      
        
          S
          
            n
          
        
      
    
    {\displaystyle S_{n}}
  
における共役類（したがって、上記より既約表現）は、nの分割に対応する。例えば、
  
    
      
        
          S
          
            3
          
        
      
    
    {\displaystyle S_{3}}
  
は3つの既約表現を持ち、それらは以下の分割に対応する。

3の分割について。このような分割に対して、ヤング図形は分割を視覚的に表現する図式的な道具である。このような分割（あるいはヤング図形）に対応する既約表現は、スペヒト加群と呼ばれる。

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
  
の表現を生じ、その逆も制限によって成り立つ。これらすべての表現環の直和は

これらの構成から継承されるホップ代数の構造は、対称関数と密接に関連していることが判明している。

### リー型の有限群

ある程度まで、
  
    
      
        G
        
          L
          
            n
          
        
        (
        
          
            F
          
          
            q
          
        
        )
      
    
    {\displaystyle GL_{n}(\mathbf {F} _{q})}
  
の表現は、nが変化するにつれて、
  
    
      
        
          S
          
            n
          
        
      
    
    {\displaystyle S_{n}}
  
の場合と同様の性質を持つ。前述の誘導過程は、いわゆる放物型誘導に置き換えられる。しかし、すべての表現が自明な表現の誘導によって得られる
  
    
      
        
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
  
についてはこれが成り立たない。その代わり、カスプ表現として知られる新たな構成要素が必要となる。

G
        
          L
          
            n
          
        
        (
        
          
            F
          
          
            q
          
        
        )
      
    
    {\displaystyle GL_{n}(\mathbf {F} _{q})}
  
の表現、より一般的にはリー型の有限群の表現は、徹底的に研究されてきた。Bonnafé (2010)は
  
    
      
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
  
の表現論の類似性は、有限群の枠組みを超えている。カスプ形式の哲学は、これらの種類の群の表現論的側面と、Qpのような局所体上の一般線型群との親和性を強調している。およびアデール環との親和性については、Bump (2004)を参照のこと。

## 展望—コンパクト群の表現

コンパクト群の表現論は、ある程度まで局所コンパクト群へと拡張可能である。この文脈における表現論は、調和解析や保型形式の研究において極めて重要である。証明や詳細な情報、本章の範囲を超える洞察については、[4] および [5] を参照されたい。

### 定義と性質

位相群とは、群演算および逆元をとる操作が連続となるような位相を備えた群である。このような群は、
  
    
      
        G
        ,
      
    
    {\displaystyle G,}
  
の開被覆が有限部分被覆を持つとき、コンパクトであると呼ばれる。コンパクト群の閉部分群は、再びコンパクトとなる。

G
      
    
    {\displaystyle G}
  
をコンパクト群とし、
  
    
      
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
  
は2変数
  
    
      
        s
        ∈
        G
      
    
    {\displaystyle s\in G}
  
および
  
    
      
        v
        ∈
        V
        .
      
    
    {\displaystyle v\in V.}
  
に関する連続関数である。

G
      
    
    {\displaystyle G}
  
からバナッハ空間
  
    
      
        V
      
    
    {\displaystyle V}
  
への線型表現とは、
  
    
      
        G
      
    
    {\displaystyle G}
  
からすべての全単射な有界線型作用素の集合への連続な群準同型として定義される。
  
    
      
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
  
であるため、最後の要件は省略できる。以下では、特にヒルベルト空間におけるコンパクト群の表現を考察する。

有限群の場合と同様に、群環と畳み込み環を定義できる。しかし、無限群の場合、構成中に連続性の条件が失われるため、群環は有益な情報を提供しない。その代わり、畳み込み環
  
    
      
        
          L
          
            1
          
        
        (
        G
        )
      
    
    {\displaystyle L^{1}(G)}
  
がその役割を果たす。

有限群の表現論における性質の多くは、適切な変更を加えることでコンパクト群へと引き継ぐことができる。そのためには、有限群における和に相当するものが必要となる。

### ハール測度の存在と一意性

コンパクト群
  
    
      
        G
      
    
    {\displaystyle G}
  
上には、ただ一つの測度が存在する。
  
    
      
        d
        t
        ,
      
    
    {\displaystyle dt,}
  
それは以下の条件を満たす。

- 左不変な測度であること。
- 群全体が単位測度を持つこと。
このような左不変かつ正規化された測度は、群
  
    
      
        G
        .
      
    
    {\displaystyle G.}
  
のハール測度と呼ばれる。

G
      
    
    {\displaystyle G}
  
はコンパクトであるため、この測度は右不変でもある、すなわち以下が成り立つことを示すことができる。

上記のスケール調整により、有限群上のハール測度は、すべての
  
    
      
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

「性質」の節で述べた有限群の表現に関する定義はすべて、コンパクト群の表現にも適用される。ただし、いくつかの修正が必要である。

部分表現を定義するためには、閉部分空間が必要となる。有限次元表現空間においてはすべての部分空間がすでに閉じているため、これは必要ではなかった。さらに、コンパクト群
  
    
      
        G
      
    
    {\displaystyle G}
  
の2つの表現
  
    
      
        ρ
        ,
        π
      
    
    {\displaystyle \rho ,\pi }
  
が同値であるとは、表現空間の間に全単射かつ連続な線形作用素
  
    
      
        T
      
    
    {\displaystyle T}
  
が存在し、その逆写像も連続であり、かつすべての
  
    
      
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
  
を満たすことをいう。

もし
  
    
      
        T
      
    
    {\displaystyle T}
  
がユニタリであれば、その2つの表現はユニタリ同値と呼ばれる。

G
      
    
    {\displaystyle G}
  
不変ではない内積から
  
    
      
        G
      
    
    {\displaystyle G}
  
不変な内積を得るためには、和の代わりに
  
    
      
        G
      
    
    {\displaystyle G}
  
上の積分を用いる必要がある。もし
  
    
      
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
  
上の内積であり、それが
  
    
      
        G
        ,
      
    
    {\displaystyle G,}
  
の表現
  
    
      
        ρ
      
    
    {\displaystyle \rho }
  
に関して不変でないならば、

は、上の
  
    
      
        G
      
    
    {\displaystyle G}
  
不変な内積である。
  
    
      
        V
      
    
    {\displaystyle V}
  
これはハール測度の性質によるものである。
  
    
      
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
  
を
  
    
      
        
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
  
（ここで
  
    
      
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
  
）によって定義する。

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
  
および
  
    
      
        s
        ↦
        
          R
          
            s
          
        
      
    
    {\displaystyle s\mapsto R_{s}}
  
は互いに双対である。

もし
  
    
      
        G
      
    
    {\displaystyle G}
  
が無限群であれば、これらの表現は有限次数を持たない。冒頭で定義した左正則表現および右正則表現は、群
  
    
      
        G
      
    
    {\displaystyle G}
  
が有限群であるならば、上で定義した左正則表現および右正則表現と同型である。これは、この場合に
  
    
      
        
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
  
が成り立つことによる。

### 構成と分解

与えられた表現から新しい表現を構成する様々な方法は、後述する双対表現を除き、コンパクト群に対しても同様に用いることができる。直和およびテンソル積は、有限個の加群や因子を持つ場合、有限群の場合と全く同様に定義される。対称積や交代積についても同様である。しかし、直積上のハール測度が必要となる。コンパクト群の直積について、2つの群の直積の既約表現が（同型を除いて）各因子群の既約表現のテンソル積に他ならないという定理を拡張するためには、ハール測度が必要である。まず、2つのコンパクト群の直積
  
    
      
        
          G
          
            1
          
        
        ×
        
          G
          
            2
          
        
      
    
    {\displaystyle G_{1}\times G_{2}}
  
は、直積位相を備えることで再びコンパクト群となることに注意する。このとき、直積上のハール測度は、各因子群上のハール測度の積として与えられる。

コンパクト群上の双対表現を考えるには、ベクトル空間
  
    
      
        V
        .
      
    
    {\displaystyle V.}
  
の位相的双対
  
    
      
        
          V
          ′
        
      
    
    {\displaystyle V'}
  
が必要である。これは、ベクトル空間
  
    
      
        V
      
    
    {\displaystyle V}
  
から基礎体へのすべての連続線形汎関数のなすベクトル空間である。
  
    
      
        π
      
    
    {\displaystyle \pi }
  
をコンパクト群
  
    
      
        G
      
    
    {\displaystyle G}
  
の
  
    
      
        V
        .
      
    
    {\displaystyle V.}
  
における表現とする。

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
  
に対して与えられると結論づけることができる。
  
    
      
        
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
  
この写像は
  
    
      
        
          π
          ′
        
      
    
    {\displaystyle \pi '}
  
再び連続群準同型であり、したがって表現である。

ヒルベルト空間について：
  
    
      
        π
      
    
    {\displaystyle \pi }
  
が既約であるための必要十分条件は
  
    
      
        
          π
          ′
        
      
    
    {\displaystyle \pi '}
  
が既約であることである。

「分解」の節の結果をコンパクト群に転用することで、以下の定理が得られる。

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
  
有限群の場合と同様に、既約表現に対して定義する。
  
    
      
        (
        τ
        ,
        
          V
          
            τ
          
        
        )
      
    
    {\displaystyle (\tau ,V_{\tau })}
  
を、そのアイソタイプ（またはアイソタイプ成分）とする。
  
    
      
        ρ
      
    
    {\displaystyle \rho }
  
を、以下の部分空間とする。

これは、
  
    
      
        
          V
          
            τ
          
        
        .
      
    
    {\displaystyle V_{\tau }.}
  
と
  
    
      
        G
      
    
    {\displaystyle G}
  
同型であるすべての不変閉部分空間
  
    
      
        U
        ,
      
    
    {\displaystyle U,}
  
の和である。

同値でない既約表現のアイソタイプは、互いに直交することに注意されたい。

標準分解
  
    
      
        
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
  
への対応する射影は、その中で
  
    
      
        V
        (
        τ
        )
      
    
    {\displaystyle V(\tau )}
  
が
  
    
      
        V
        ,
      
    
    {\displaystyle V,}
  
のアイソタイプである場合、コンパクト群に対して次のように与えられる。

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
  
および
  
    
      
        
          χ
          
            τ
          
        
      
    
    {\displaystyle \chi _{\tau }}
  
は既約表現
  
    
      
        τ
        .
      
    
    {\displaystyle \tau .}
  
に対応する指標である。

#### 射影公式

コンパクト群のすべての表現
  
    
      
        (
        ρ
        ,
        V
        )
      
    
    {\displaystyle (\rho ,V)}
  
に対して、
  
    
      
        G
      
    
    {\displaystyle G}
  
を次のように定義する。

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
  
は
  
    
      
        G
      
    
    {\displaystyle G}
  
線形ではない。ここで

写像
  
    
      
        P
      
    
    {\displaystyle P}
  
は、自己準同型として定義され、
  
    
      
        V
      
    
    {\displaystyle V}
  
上で以下の性質を持つ。

これはヒルベルト空間
  
    
      
        V
        .
      
    
    {\displaystyle V.}
  
の内積に対して有効である。

そのとき
  
    
      
        P
      
    
    {\displaystyle P}
  
は
  
    
      
        G
      
    
    {\displaystyle G}
  
線形である。なぜなら

ここでハール測度の不変性を用いた。

表現が有限次元であれば、有限群の場合と同様に、自明な部分表現の直和を決定することが可能である。

### 指標、シューアの補題、および内積

一般に、コンパクト群の表現はヒルベルト空間やバナッハ空間上で研究される。多くの場合、これらは有限次元ではない。そのため、コンパクト群の表現について語る際に指標に言及することは有用ではない。それにもかかわらず、多くの場合、有限次元の場合に限定して研究を行うことが可能である。

コンパクト群の既約表現は有限次元かつユニタリであるため（最初の小節の結果を参照）、有限群の場合と同様の方法で既約指標を定義できる。

構成された表現が有限次元である限り、新たに構成された表現の指標は有限群の場合と同じ方法で得られる。

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
  
に対して性質
  
    
      
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
  
を満たす任意の有界作用素
  
    
      
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
  
となるような
  
    
      
        λ
        ∈
        
          C
        
      
    
    {\displaystyle \lambda \in \mathbb {C} }
  
が存在する。

は、コンパクト群のすべての二乗可積分関数
  
    
      
        
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
  
同様に

は、コンパクト群
  
    
      
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
  
すなわち
  
    
      
        χ
      
    
    {\displaystyle \chi }
  
は「ノルム」
  
    
      
        1.
      
    
    {\displaystyle 1.}
  
を持つ。
したがって、第一定理を用いると、
  
    
      
        G
      
    
    {\displaystyle G}
  
の既約表現の指標は、この内積に関して
  
    
      
        
          
            C
          
          
            class
          
        
        (
        G
        )
      
    
    {\displaystyle \mathbb {C} _{\text{class}}(G)}
  
上で正規直交系をなす。

- G
      
    
    {\displaystyle G}
  
はアーベル群である。
- G
      
    
    {\displaystyle G}
  
のすべての既約表現は次数
  
    
      
        1.
      
    
    {\displaystyle 1.}
  
を持つ。
非同型な既約表現が正規直交基底をなすことはすでに知られているため、それらが
  
    
      
        
          L
          
            2
          
        
        (
        G
        )
        .
      
    
    {\displaystyle L^{2}(G).}
  
を生成することを確認するだけでよい。これは、以下の空間上に非零の二乗可積分関数が存在しないことを証明することで達成される。
  
    
      
        G
      
    
    {\displaystyle G}
  
すべての既約指標と直交する。

有限群の場合と同様に、群
  
    
      
        G
      
    
    {\displaystyle G}
  
の同型を除いた既約表現の数は、その群の共役類の数と等しい。
  
    
      
        G
        .
      
    
    {\displaystyle G.}
  
しかし、コンパクト群は一般に無限個の共役類を持つため、これでは有用な情報は得られない。

### 誘導表現

H
      
    
    {\displaystyle H}
  
がコンパクト群における有限指数の閉部分群である場合、
  
    
      
        G
        ,
      
    
    {\displaystyle G,}
  
有限群に対する誘導表現の定義をそのまま採用できる。

しかし、誘導表現はより一般的に定義することが可能であり、その定義は部分群
  
    
      
        H
        .
      
    
    {\displaystyle H.}
  
の指数に依存せずに有効である。

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
  
次の性質を持つ。
  
    
      
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
  
すべての に対して。
  
    
      
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

そして表現
  
    
      
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

誘導表現は再びユニタリ表現となる。

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
  
に等しい重複度で現れることに注意されたい。

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
  
そのとき、標準的な同型が存在する。

フロベニウスの相互律は、内積と双線形形式の定義を修正することで、コンパクト群にも適用される。この定理は現在、類関数ではなく
  
    
      
        G
      
    
    {\displaystyle G}
  
上の二乗可積分関数に対して成立するが、部分群
  
    
      
        H
      
    
    {\displaystyle H}
  
は閉じていなければならない。

### ピーター・ワイルの定理

コンパクト群の表現論におけるもう一つの重要な結果は、ピーター・ワイルの定理である。これは調和解析における中心的かつ基本的な主張の一つであるため、通常は調和解析の中で提示され証明される。

この定理を再定式化することで、コンパクト群上の関数に対するフーリエ級数の一般化を得ることができる。

## 歴史

複素数体上の有限群 G の表現論の一般的な特徴は、1900年以前にフェルディナント・ゲオルク・フロベニウスによって発見された。その後、リチャード・ブラウアーによるモジュラー表現論が発展した。

## 関連項目

- Character theory
- シューアの直交関係
- McKay conjecture
- Burnside ring

## 参考文献

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